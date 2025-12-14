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
  
  if (economyData && economyData.tradeRoutes && economyData.tradeRoutes.length > 0) {
    svgContent += '<g id="economy-trade" class="economy-trade">';
    
    const maxTradeValue = Math.max(...economyData.tradeRoutes.map(r => r.value));
    
    for (const route of economyData.tradeRoutes) {
      const burg1 = burgs[route.from];
      const burg2 = burgs[route.to];
      
      if (!burg1 || !burg2 || !burg1.cell || !burg2.cell) continue;
      
      const [x1, y1] = cells.p[burg1.cell];
      const [x2, y2] = cells.p[burg2.cell];
      
      const normalizedValue = route.value / maxTradeValue;
      const strokeWidth = 0.5 + normalizedValue * 2;
      const opacity = 0.3 + normalizedValue * 0.5;
      
      svgContent += `<line 
        x1="${x1}" y1="${y1}" 
        x2="${x2}" y2="${y2}" 
        stroke="#f39c12" 
        stroke-width="${strokeWidth}" 
        stroke-opacity="${opacity}"
        stroke-linecap="round"
        stroke-dasharray="${route.sameState ? 'none' : '3,2'}"/>`;
    }
    svgContent += '</g>';
  }
  
  svgContent += '<g id="economy-flows" class="economy-flows">';
  
  for (let i = 0; i < cells.i.length; i++) {
    const trade = cells.trade[i];
    if (!trade || trade < 1) continue;
    
    const [x, y] = cells.p[i];
    const radius = Math.min(3, 0.5 + trade * 0.1);
    
    svgContent += `<circle cx="${x}" cy="${y}" r="${radius}" 
      fill="#2ecc71" fill-opacity="0.6" 
      stroke="#27ae60" stroke-width="0.2"/>`;
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
