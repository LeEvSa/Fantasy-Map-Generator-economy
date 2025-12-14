"use strict";

function openEconomyEditor() {
  closeDialogs("#economyEditor");
  
  if (!pack.cells.resource) {
    Resources.generate();
  }
  if (!pack.cells.wealth) {
    Economy.initialize();
  }
  
  const economyData = Economy.getEconomyData();
  const currentTurn = Economy.getCurrentTurn();
  
  const html = `
    <div id="economyEditor" class="dialog stable">
      <div class="dialog-header">
        <h3>Economy Editor</h3>
        <span id="economyEditorClose" class="close">×</span>
      </div>
      <div class="dialog-content" style="padding: 10px; max-height: 400px; overflow-y: auto;">
        <div style="margin-bottom: 15px; padding: 10px; background: #f5f5f5; border-radius: 5px;">
          <h4 style="margin: 0 0 10px 0;">Turn-Based Economy</h4>
          <div style="display: flex; align-items: center; gap: 10px;">
            <span>Current Turn: <strong id="economyCurrentTurn">${currentTurn}</strong></span>
            <button id="economyAdvanceTurn" style="padding: 5px 15px;">Advance Turn</button>
          </div>
        </div>
        
        <div style="margin-bottom: 15px;">
          <h4 style="margin: 0 0 10px 0;">Global Statistics</h4>
          <div id="economyGlobalStats" style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
            ${getGlobalStatsHtml(economyData)}
          </div>
        </div>
        
        <div style="margin-bottom: 15px;">
          <h4 style="margin: 0 0 10px 0;">State Economies</h4>
          <div id="economyStateList" style="max-height: 200px; overflow-y: auto;">
            ${getStateEconomiesHtml(economyData)}
          </div>
        </div>
        
        <div>
          <h4 style="margin: 0 0 10px 0;">Resource Distribution</h4>
          <div id="economyResourceList">
            ${getResourceDistributionHtml()}
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML("beforeend", html);
  
  const editor = document.getElementById("economyEditor");
  editor.style.position = "fixed";
  editor.style.top = "50px";
  editor.style.left = "50%";
  editor.style.transform = "translateX(-50%)";
  editor.style.width = "400px";
  editor.style.background = "white";
  editor.style.border = "1px solid #ccc";
  editor.style.borderRadius = "5px";
  editor.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
  editor.style.zIndex = "1000";
  
  document.getElementById("economyEditorClose").onclick = closeEconomyEditor;
  document.getElementById("economyAdvanceTurn").onclick = handleAdvanceTurn;
}

function getGlobalStatsHtml(economyData) {
  if (!economyData) return "<div>No economy data available</div>";
  
  const totalWealth = Math.round(economyData.totalWealth || 0);
  const totalProduction = Math.round(economyData.totalProduction || 0);
  const tradeRoutes = (economyData.tradeRoutes || []).length;
  const totalTrade = Math.round((economyData.tradeRoutes || []).reduce((sum, r) => sum + r.value, 0));
  
  return `
    <div>Total Wealth: <strong>${totalWealth.toLocaleString()}</strong></div>
    <div>Total Production: <strong>${totalProduction.toLocaleString()}</strong></div>
    <div>Trade Routes: <strong>${tradeRoutes}</strong></div>
    <div>Trade Volume: <strong>${totalTrade.toLocaleString()}</strong></div>
  `;
}

function getStateEconomiesHtml(economyData) {
  if (!economyData || !economyData.states) return "<div>No state data available</div>";
  
  const states = Object.values(economyData.states);
  if (states.length === 0) return "<div>No states found</div>";
  
  return states.map(state => `
    <div style="padding: 5px; margin: 2px 0; background: #f9f9f9; border-radius: 3px;">
      <strong>${state.name}</strong>
      <div style="font-size: 11px; color: #666;">
        Treasury: ${Math.round(state.treasury).toLocaleString()} | 
        Income: ${Math.round(state.income).toLocaleString()} | 
        Trade: ${Math.round(state.tradeBalance).toLocaleString()}
      </div>
    </div>
  `).join("");
}

function getResourceDistributionHtml() {
  const resourceTypes = Resources.getResourceTypes();
  const {cells} = pack;
  
  const resourceCounts = {};
  for (let i = 0; i < cells.i.length; i++) {
    const resourceId = cells.resource ? cells.resource[i] : 0;
    if (!resourceId) continue;
    
    resourceCounts[resourceId] = (resourceCounts[resourceId] || 0) + 1;
  }
  
  const resourceEntries = Object.entries(resourceCounts)
    .map(([id, count]) => {
      const resource = Resources.getResourceById(parseInt(id));
      return resource ? {name: resource.name, icon: resource.icon, count, color: resource.color} : null;
    })
    .filter(r => r)
    .sort((a, b) => b.count - a.count);
  
  if (resourceEntries.length === 0) return "<div>No resources generated yet</div>";
  
  return resourceEntries.map(r => `
    <div style="display: flex; align-items: center; gap: 5px; padding: 3px;">
      <span style="font-size: 16px;">${r.icon}</span>
      <span style="flex: 1;">${r.name}</span>
      <span style="background: ${r.color}; padding: 2px 8px; border-radius: 3px; color: #333; font-size: 11px;">
        ${r.count} tiles
      </span>
    </div>
  `).join("");
}

function handleAdvanceTurn() {
  Economy.advanceTurn();
  
  const economyData = Economy.getEconomyData();
  const currentTurn = Economy.getCurrentTurn();
  
  document.getElementById("economyCurrentTurn").textContent = currentTurn;
  document.getElementById("economyGlobalStats").innerHTML = getGlobalStatsHtml(economyData);
  document.getElementById("economyStateList").innerHTML = getStateEconomiesHtml(economyData);
  
  if (layerIsOn("toggleEconomy")) {
    drawEconomy();
  }
  
  tip(`Turn ${currentTurn} completed. Economy updated.`);
}

function closeEconomyEditor() {
  const editor = document.getElementById("economyEditor");
  if (editor) editor.remove();
}

function closeDialogs(selector) {
  if (!selector) return;
  const existing = document.querySelector(selector);
  if (existing) existing.remove();
}
