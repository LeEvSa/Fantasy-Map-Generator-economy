"use strict";

const EconomyRenderer = (function () {
  let resourceLayer = null;
  let isVisible = false;

  function initialize() {
    resourceLayer = svg.select("#terrs").insert("g", ":first-child").attr("id", "resourceLayer");
    console.log("Economy renderer initialized");
  }

  function render() {
    if (!Economy.getData()) {
      Economy.initialize();
    }

    if (!resourceLayer) {
      initialize();
    }

    resourceLayer.selectAll("*").remove();

    const cellResources = Economy.getData().cellResources;
    const cells = pack.cells;

    for (const [cellId, cellResource] of cellResources) {
      const resourceDef = EconomyConfig.RESOURCES[cellResource.resourceId];
      if (!resourceDef) continue;

      const [x, y] = cells.p[cellId];
      
      const group = resourceLayer.append("g")
        .attr("class", "resource-marker")
        .attr("data-cell", cellId)
        .attr("data-resource", cellResource.resourceId)
        .attr("transform", `translate(${x}, ${y})`);

      let bgColor = "#999";
      if (resourceDef.category === "strategic") bgColor = "#e74c3c";
      else if (resourceDef.category === "luxury") bgColor = "#9b59b6";
      else if (resourceDef.category === "bonus") bgColor = "#27ae60";

      const radius = 4;

      group.append("circle")
        .attr("r", radius + 1)
        .attr("fill", cellResource.improved ? "#fff" : "rgba(0,0,0,0.3)")
        .attr("stroke", bgColor)
        .attr("stroke-width", cellResource.improved ? 2 : 1);

      group.append("text")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("font-size", "8px")
        .text(resourceDef.icon);

      group.append("title")
        .text(`${resourceDef.name} (${resourceDef.category})${cellResource.improved ? ' - Improved' : ''}`);
    }

    if (isVisible) {
      resourceLayer.style("display", null);
    }

    console.log(`Rendered ${cellResources.size} resource markers`);
  }

  function show() {
    if (!resourceLayer) {
      initialize();
      render();
    }
    resourceLayer.style("display", null);
    isVisible = true;
  }

  function hide() {
    if (resourceLayer) {
      resourceLayer.style("display", "none");
    }
    isVisible = false;
  }

  function toggle() {
    if (isVisible) {
      hide();
    } else {
      show();
      if (resourceLayer.selectAll("*").empty()) {
        render();
      }
    }
  }

  function highlightCell(cellId) {
    resourceLayer.selectAll(".resource-marker").classed("highlighted", false);
    resourceLayer.select(`[data-cell="${cellId}"]`).classed("highlighted", true);
  }

  function getResourceAtPoint(x, y) {
    const cells = pack.cells;
    
    let closestCell = null;
    let closestDist = Infinity;
    
    for (const [cellId, _] of Economy.getData().cellResources) {
      const [cx, cy] = cells.p[cellId];
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (dist < closestDist && dist < 10) {
        closestDist = dist;
        closestCell = cellId;
      }
    }
    
    return closestCell;
  }

  return {
    initialize,
    render,
    show,
    hide,
    toggle,
    highlightCell,
    getResourceAtPoint
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = EconomyRenderer;
}
