"use strict";

function openEconomyOverview() {
  closeDialogs("#economyOverview");
  
  if (!pack.cells.resource) {
    Resources.generate();
  }
  if (!pack.cells.wealth) {
    Economy.initialize();
  }
  
  const html = `
    <div id="economyOverview" class="dialog stable">
      <div class="dialog-header" style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #f5f5f5; border-bottom: 1px solid #ddd;">
        <h3 style="margin: 0;">Global Economy Overview</h3>
        <span id="economyOverviewClose" class="close" style="cursor: pointer; font-size: 20px;">&times;</span>
      </div>
      <div class="dialog-content" style="padding: 10px; max-height: 500px; overflow-y: auto;">
        <div id="economyOverviewTable">
          ${buildEconomyTable()}
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML("beforeend", html);
  
  const overview = document.getElementById("economyOverview");
  overview.style.position = "fixed";
  overview.style.top = "50px";
  overview.style.left = "50%";
  overview.style.transform = "translateX(-50%)";
  overview.style.width = "90%";
  overview.style.maxWidth = "900px";
  overview.style.background = "white";
  overview.style.border = "1px solid #ccc";
  overview.style.borderRadius = "5px";
  overview.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
  overview.style.zIndex = "1000";
  
  document.getElementById("economyOverviewClose").onclick = closeEconomyOverview;
}

function buildEconomyTable() {
  const economyData = Economy.getEconomyData();
  const {states, burgs, cells} = pack;
  
  if (!economyData || !economyData.states) {
    return "<div>No economy data available. Generate a map first.</div>";
  }
  
  const allResources = new Set();
  for (const stateId in economyData.states) {
    const stateData = economyData.states[stateId];
    if (stateData.resources) {
      Object.keys(stateData.resources).forEach(r => allResources.add(r));
    }
  }
  
  const resourceList = Array.from(allResources).sort();
  const topResources = resourceList.slice(0, 8);
  
  const resourceTypes = Resources.getResourceTypes();
  const resourceHeaders = topResources.map(name => {
    const rt = Object.values(resourceTypes).find(r => r.name === name);
    return `<th style="padding: 8px 4px; text-align: center; min-width: 50px;" title="${name}">${rt ? rt.icon : name.substring(0, 3)}</th>`;
  }).join("");
  
  let tableHtml = `
    <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
      <thead>
        <tr style="background: #3498db; color: white;">
          <th style="padding: 10px; text-align: left;">Nation</th>
          <th style="padding: 10px; text-align: center;">Cities</th>
          <th style="padding: 10px; text-align: center;">Population</th>
          ${resourceHeaders}
          <th style="padding: 10px; text-align: right;">Money/Turn</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  const stateRows = [];
  
  for (const stateId in economyData.states) {
    const stateData = economyData.states[stateId];
    const state = states[stateId];
    if (!state || !state.i) continue;
    
    const stateBurgs = burgs.filter((b, i) => 
      i > 0 && b.i && b.cell && cells.state[b.cell] === parseInt(stateId)
    );
    const cityCount = stateBurgs.length;
    
    let totalPop = 0;
    for (let c = 0; c < cells.i.length; c++) {
      if (cells.state[c] === parseInt(stateId)) {
        totalPop += cells.pop[c] || 0;
      }
    }
    const popDisplay = totalPop > 1000 ? `${(totalPop / 1000).toFixed(1)}k` : Math.round(totalPop);
    
    const resourceCells = topResources.map(name => {
      const amount = stateData.resources && stateData.resources[name] 
        ? Math.round(stateData.resources[name].amount) 
        : 0;
      const cellClass = amount > 0 ? "has-resource" : "no-resource";
      return `<td style="padding: 6px 4px; text-align: center; ${amount > 0 ? 'background: #e8f4fc;' : 'color: #ccc;'}">${amount || '-'}</td>`;
    }).join("");
    
    const moneyPerTurn = Math.round(stateData.income - stateData.expenses);
    const moneyColor = moneyPerTurn >= 0 ? "#27ae60" : "#e74c3c";
    const moneySign = moneyPerTurn >= 0 ? "+" : "";
    
    stateRows.push({
      name: state.name,
      color: state.color || "#999",
      cityCount,
      popDisplay,
      totalPop,
      resourceCells,
      moneyPerTurn,
      moneyColor,
      moneySign,
      treasury: stateData.treasury
    });
  }
  
  stateRows.sort((a, b) => b.totalPop - a.totalPop);
  
  for (const row of stateRows) {
    tableHtml += `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 8px;">
          <span style="display: inline-block; width: 12px; height: 12px; background: ${row.color}; border-radius: 2px; margin-right: 6px; vertical-align: middle;"></span>
          <strong>${row.name}</strong>
        </td>
        <td style="padding: 8px; text-align: center;">${row.cityCount}</td>
        <td style="padding: 8px; text-align: center;">${row.popDisplay}</td>
        ${row.resourceCells}
        <td style="padding: 8px; text-align: right; color: ${row.moneyColor}; font-weight: bold;">
          ${row.moneySign}${row.moneyPerTurn}
          <div style="font-size: 10px; color: #999; font-weight: normal;">Treasury: ${Math.round(row.treasury)}</div>
        </td>
      </tr>
    `;
  }
  
  tableHtml += `
      </tbody>
    </table>
  `;
  
  const totalWealth = Math.round(economyData.totalWealth || 0);
  const totalProduction = Math.round(economyData.totalProduction || 0);
  
  tableHtml += `
    <div style="margin-top: 15px; padding: 10px; background: #f9f9f9; border-radius: 5px; display: flex; justify-content: space-around;">
      <div><strong>Total Wealth:</strong> ${totalWealth.toLocaleString()}</div>
      <div><strong>Total Production:</strong> ${totalProduction.toLocaleString()}</div>
      <div><strong>Nations:</strong> ${stateRows.length}</div>
    </div>
  `;
  
  return tableHtml;
}

function closeEconomyOverview() {
  const overview = document.getElementById("economyOverview");
  if (overview) overview.remove();
}
