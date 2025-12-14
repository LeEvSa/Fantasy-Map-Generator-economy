"use strict";

function drawResources() {
  TIME && console.time("drawResources");
  
  let resourcesGroup = document.getElementById("resources");
  if (!resourcesGroup) {
    const viewbox = document.getElementById("viewbox");
    if (!viewbox) {
      TIME && console.timeEnd("drawResources");
      return;
    }
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.id = "resources";
    viewbox.appendChild(g);
    resourcesGroup = g;
  }
  
  resourcesGroup.innerHTML = "";
  
  if (!pack.cells.resource) {
    TIME && console.timeEnd("drawResources");
    return;
  }
  
  const {cells, vertices} = pack;
  const resourceTypes = Resources.getResourceTypes();
  const resourcePaths = {};
  const resourceIcons = [];
  
  for (const [key, resource] of Object.entries(resourceTypes)) {
    resourcePaths[resource.id] = [];
  }
  
  for (let i = 0; i < cells.i.length; i++) {
    const resourceId = cells.resource[i];
    if (!resourceId) continue;
    
    const resource = Resources.getResourceById(resourceId);
    if (!resource) continue;
    
    const cellVertices = cells.v[i];
    if (!cellVertices || cellVertices.length < 3) continue;
    
    const points = cellVertices.map(v => vertices.p[v]).filter(p => p);
    if (points.length < 3) continue;
    
    const path = "M" + points.map(p => p.join(",")).join("L") + "Z";
    resourcePaths[resourceId].push(path);
    
    const [x, y] = cells.p[i];
    const amount = cells.resourceAmount[i];
    
    if (scale > 2) {
      resourceIcons.push({
        x: x,
        y: y,
        icon: resource.icon,
        amount: amount,
        color: resource.color
      });
    }
  }
  
  let svgContent = '<defs>';
  for (const [key, resource] of Object.entries(resourceTypes)) {
    svgContent += `<pattern id="resource-pattern-${resource.id}" patternUnits="userSpaceOnUse" width="10" height="10">
      <rect width="10" height="10" fill="${resource.color}" opacity="0.4"/>
    </pattern>`;
  }
  svgContent += '</defs>';
  
  for (const [resourceId, paths] of Object.entries(resourcePaths)) {
    if (paths.length === 0) continue;
    const resource = Resources.getResourceById(parseInt(resourceId));
    svgContent += `<g id="resource-${resourceId}" class="resource-layer">
      <path d="${paths.join("")}" fill="${resource.color}" fill-opacity="0.35" stroke="${resource.color}" stroke-width="0.3" stroke-opacity="0.5"/>
    </g>`;
  }
  
  if (resourceIcons.length > 0 && scale > 3) {
    svgContent += '<g id="resource-icons" class="resource-icons">';
    for (const icon of resourceIcons) {
      svgContent += `<text x="${icon.x}" y="${icon.y}" 
        font-size="${6 / scale}" 
        text-anchor="middle" 
        dominant-baseline="central"
        style="pointer-events: none;">${icon.icon}</text>`;
    }
    svgContent += '</g>';
  }
  
  resourcesGroup.innerHTML = svgContent;
  
  TIME && console.timeEnd("drawResources");
}

function toggleResources(event) {
  if (event && event.ctrlKey) {
    editStyle("resources");
    return;
  }
  
  const button = document.getElementById("toggleResources");
  const isOn = button && !button.classList.contains("buttonoff");
  
  if (isOn) {
    const resourcesGroup = document.getElementById("resources");
    if (resourcesGroup) resourcesGroup.style.display = "none";
    if (button) button.classList.add("buttonoff");
  } else {
    if (!pack.cells.resource) Resources.generate();
    drawResources();
    const resourcesGroup = document.getElementById("resources");
    if (resourcesGroup) resourcesGroup.style.display = "block";
    if (button) button.classList.remove("buttonoff");
  }
}
