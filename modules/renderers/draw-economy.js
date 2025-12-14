"use strict";

function drawEconomy() {
  TIME && console.time("drawEconomy");
  
  let economyGroup = document.getElementById("economy");
  if (!economyGroup) {
    const viewbox = document.getElementById("viewbox");
    if (!viewbox) {
      TIME && console.timeEnd("drawEconomy");
      return;
    }
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.id = "economy";
    viewbox.appendChild(g);
    economyGroup = g;
  }
  
  economyGroup.innerHTML = "";
  
  if (!pack.cells.wealth) {
    Economy.initialize();
  }
  
  const {cells, vertices, burgs} = pack;
  const economyData = Economy.getEconomyData();
  
  const wealthValues = Array.from(cells.wealth).filter(w => w > 0);
  if (wealthValues.length === 0) {
    TIME && console.timeEnd("drawEconomy");
    return;
  }
  
  const maxWealth = Math.max(...wealthValues);
  const minWealth = Math.min(...wealthValues);
  const wealthRange = maxWealth - minWealth || 1;
  
  const wealthColors = [
    {threshold: 0.0, color: "#fee0d2"},
    {threshold: 0.2, color: "#fcbba1"},
    {threshold: 0.4, color: "#fc9272"},
    {threshold: 0.6, color: "#fb6a4a"},
    {threshold: 0.8, color: "#de2d26"},
    {threshold: 1.0, color: "#a50f15"}
  ];
  
  function getWealthColor(wealth) {
    const normalized = (wealth - minWealth) / wealthRange;
    for (let i = wealthColors.length - 1; i >= 0; i--) {
      if (normalized >= wealthColors[i].threshold) {
        return wealthColors[i].color;
      }
    }
    return wealthColors[0].color;
  }
  
  let svgContent = '<g id="economy-wealth" class="economy-wealth">';
  
  for (let i = 0; i < cells.i.length; i++) {
    const wealth = cells.wealth[i];
    if (!wealth || cells.h[i] < 20) continue;
    
    const cellVertices = cells.v[i];
    if (!cellVertices || cellVertices.length < 3) continue;
    
    const points = cellVertices.map(v => vertices.p[v]).filter(p => p);
    if (points.length < 3) continue;
    
    const path = "M" + points.map(p => p.join(",")).join("L") + "Z";
    const color = getWealthColor(wealth);
    
    svgContent += `<path d="${path}" fill="${color}" fill-opacity="0.5"/>`;
  }
  svgContent += '</g>';
  
  if (economyData && economyData.resourceFlows && economyData.resourceFlows.length > 0) {
    svgContent += '<g id="economy-resource-flows" class="economy-resource-flows">';
    
    const maxAmount = Math.max(...economyData.resourceFlows.map(r => r.amount));
    
    for (const flow of economyData.resourceFlows) {
      const [x1, y1] = cells.p[flow.fromCell];
      const [x2, y2] = cells.p[flow.toBurgCell];
      
      if (!x1 || !y1 || !x2 || !y2) continue;
      
      const normalizedAmount = flow.amount / maxAmount;
      const strokeWidth = 0.2 + normalizedAmount * 0.8;
      const opacity = 0.15 + normalizedAmount * 0.25;
      
      const resource = Resources.getResourceById(flow.resourceId);
      const color = resource ? resource.color : "#95a5a6";
      
      svgContent += `<line 
        x1="${x1}" y1="${y1}" 
        x2="${x2}" y2="${y2}" 
        stroke="${color}" 
        stroke-width="${strokeWidth}" 
        stroke-opacity="${opacity}"
        stroke-linecap="round"/>`;
    }
    svgContent += '</g>';
  }
  
  if (economyData && economyData.cityFlows && economyData.cityFlows.length > 0) {
    svgContent += '<g id="economy-city-flows" class="economy-city-flows">';
    
    const maxCityValue = Math.max(...economyData.cityFlows.map(f => f.value));
    
    for (const flow of economyData.cityFlows) {
      const [x1, y1] = cells.p[flow.fromBurgCell];
      const [x2, y2] = cells.p[flow.toBurgCell];
      
      if (!x1 || !y1 || !x2 || !y2) continue;
      
      const normalizedValue = flow.value / maxCityValue;
      const strokeWidth = 0.8 + normalizedValue * 2.5;
      const opacity = 0.4 + normalizedValue * 0.4;
      
      const state = pack.states[flow.stateId];
      const stateColor = state && state.color ? state.color : "#f39c12";
      
      svgContent += `<line 
        x1="${x1}" y1="${y1}" 
        x2="${x2}" y2="${y2}" 
        stroke="${stateColor}" 
        stroke-width="${strokeWidth}" 
        stroke-opacity="${opacity}"
        stroke-linecap="round"/>`;
    }
    svgContent += '</g>';
  }
  
  svgContent += '<g id="economy-capitals" class="economy-capitals">';
  for (const burg of burgs) {
    if (!burg || !burg.i || !burg.cell || !burg.capital) continue;
    
    const [x, y] = cells.p[burg.cell];
    svgContent += `<circle cx="${x}" cy="${y}" r="3" 
      fill="gold" fill-opacity="0.8" 
      stroke="#c9a227" stroke-width="0.5"/>`;
  }
  svgContent += '</g>';
  
  if (scale > 2) {
    svgContent += '<g id="economy-labels" class="economy-labels">';
    
    for (const burg of burgs) {
      if (!burg || !burg.i || !burg.cell) continue;
      
      const burgEconomy = Economy.getBurgEconomy(burg.i);
      if (!burgEconomy) continue;
      
      const [x, y] = cells.p[burg.cell];
      const wealth = Math.round(burgEconomy.wealth);
      
      if (wealth > 10) {
        svgContent += `<text x="${x}" y="${y + 4}" 
          font-size="${4 / scale}" 
          fill="#2c3e50"
          text-anchor="middle"
          style="pointer-events: none;">💰${wealth}</text>`;
      }
    }
    svgContent += '</g>';
  }
  
  economyGroup.innerHTML = svgContent;
  
  TIME && console.timeEnd("drawEconomy");
}

function toggleEconomy(event) {
  if (event && event.ctrlKey) {
    editStyle("economy");
    return;
  }
  
  const button = document.getElementById("toggleEconomy");
  const isOn = button && !button.classList.contains("buttonoff");
  
  if (isOn) {
    const economyGroup = document.getElementById("economy");
    if (economyGroup) economyGroup.style.display = "none";
    if (button) button.classList.add("buttonoff");
  } else {
    if (!pack.cells.wealth) {
      if (!pack.cells.resource) Resources.generate();
      Economy.initialize();
    }
    drawEconomy();
    const economyGroup = document.getElementById("economy");
    if (economyGroup) economyGroup.style.display = "block";
    if (button) button.classList.remove("buttonoff");
  }
}
