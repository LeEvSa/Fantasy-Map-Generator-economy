"use strict";

function editResources() {
  if (customization) return;
  closeDialogs("#resourcesEditor, .stable");
  if (!layerIsOn("toggleResources")) toggleResources();

  const body = document.getElementById("resourcesBody");
  refreshResourcesEditor();

  if (modules.editResources) return;
  modules.editResources = true;

  $("#resourcesEditor").dialog({
    title: "Resources Editor",
    resizable: false,
    width: fitContent(),
    close: closeResourcesEditor,
    position: {my: "right top", at: "right-10 top+10", of: "svg"}
  });

  document.getElementById("resourcesEditorRefresh").addEventListener("click", refreshResourcesEditor);
  document.getElementById("resourcesRegenerate").addEventListener("click", regenerateAllResources);
  document.getElementById("resourcesManually").addEventListener("click", enterResourcesCustomizationMode);
  document.getElementById("resourcesManuallyApply").addEventListener("click", applyResourcesChange);
  document.getElementById("resourcesManuallyCancel").addEventListener("click", () => exitResourcesCustomizationMode());
  document.getElementById("resourcesExport").addEventListener("click", downloadResourcesData);

  body.addEventListener("click", function (ev) {
    const el = ev.target;
    const cl = el.classList;
    if (cl.contains("regenerate-type")) regenerateResourceType(el);
    if (customization === 7) selectResourceOnLineClick(el);
  });

  function refreshResourcesEditor() {
    resourcesCollectStatistics();
    resourcesEditorAddLines();
  }

  function resourcesCollectStatistics() {
    const cells = pack.cells;
    const resourceTypes = Resources.getResourceTypes();
    
    window.resourcesData = {
      types: {},
      totalCells: 0,
      totalAmount: 0
    };
    
    for (const [key, resource] of Object.entries(resourceTypes)) {
      window.resourcesData.types[key] = {
        ...resource,
        key: key,
        cells: 0,
        totalAmount: 0
      };
    }
    
    for (const i of cells.i) {
      if (cells.h[i] < 20) continue;
      const resourceId = cells.resource ? cells.resource[i] : 0;
      if (!resourceId) continue;
      
      const resourceKey = Resources.getResourceKey(resourceId);
      if (resourceKey && window.resourcesData.types[resourceKey]) {
        window.resourcesData.types[resourceKey].cells++;
        window.resourcesData.types[resourceKey].totalAmount += cells.resourceAmount[i];
        window.resourcesData.totalCells++;
        window.resourcesData.totalAmount += cells.resourceAmount[i];
      }
    }
  }

  function resourcesEditorAddLines() {
    const r = window.resourcesData;
    let lines = "";
    
    const sortedTypes = Object.entries(r.types).sort((a, b) => b[1].cells - a[1].cells);
    
    for (const [key, resource] of sortedTypes) {
      lines += `
        <div
          class="states resources"
          data-id="${resource.id}"
          data-key="${key}"
          data-name="${resource.name}"
          data-cells="${resource.cells}"
          data-amount="${resource.totalAmount.toFixed(1)}"
          data-poprequired="${resource.popRequired}"
          data-maxoutput="${resource.maxOutput}"
          data-color="${resource.color}"
        >
          <fill-box fill="${resource.color}" data-key="${key}"></fill-box>
          <span class="resourceIcon" style="font-size: 16px; width: 24px; text-align: center;">${resource.icon}</span>
          <input data-tip="Resource name" class="resourceName" value="${resource.name}" readonly style="width: 70px;" />
          <span data-tip="Tiles with this resource" class="icon-check-empty hide"></span>
          <div data-tip="Tiles with this resource" class="resourceCells hide" style="width: 40px;">${resource.cells}</div>
          <span data-tip="Total amount" class="hide" style="margin-left: 5px;">Amt:</span>
          <div data-tip="Total amount" class="resourceAmount hide" style="width: 45px;">${resource.totalAmount.toFixed(1)}</div>
          <span data-tip="Population required for full output" class="hide" style="margin-left: 5px;">Pop:</span>
          <div data-tip="Population required for full output" class="resourcePop hide" style="width: 35px;">${resource.popRequired}</div>
          <span data-tip="Max output value" class="hide" style="margin-left: 5px;">Max:</span>
          <div data-tip="Max output value" class="resourceMax hide" style="width: 30px;">${resource.maxOutput}</div>
          <span data-tip="Regenerate only this resource type" class="icon-arrows-cw regenerate-type hide" data-key="${key}" style="cursor: pointer; margin-left: 5px;"></span>
        </div>
      `;
    }
    body.innerHTML = lines;

    resourcesFooterTypes.innerHTML = Object.keys(r.types).length;
    resourcesFooterCells.innerHTML = r.totalCells;
    resourcesFooterAmount.innerHTML = r.totalAmount.toFixed(1);

    body.querySelectorAll("div.resources").forEach(el => {
      el.addEventListener("mouseenter", ev => resourceHighlightOn(ev));
      el.addEventListener("mouseleave", ev => resourceHighlightOff(ev));
    });

    applySorting(resourcesHeader);
    $("#resourcesEditor").dialog({width: fitContent()});
  }

  function resourceHighlightOn(event) {
    if (customization === 7) return;
    const key = event.target.dataset.key;
    const resource = Resources.RESOURCE_TYPES[key];
    if (!resource) return;
    
    const resourceId = resource.id;
    d3.select("#resources")
      .selectAll("circle")
      .filter(function() {
        const cellId = +this.dataset.cell;
        return pack.cells.resource[cellId] === resourceId;
      })
      .attr("stroke", "#cd4c11")
      .attr("stroke-width", 2);
  }

  function resourceHighlightOff(event) {
    d3.select("#resources")
      .selectAll("circle")
      .attr("stroke", "none")
      .attr("stroke-width", 0);
  }

  function redrawResourcesLayer() {
    if (layerIsOn("toggleResources")) {
      drawResources();
    }
  }

  function regenerateAllResources() {
    alertMessage.innerHTML = "Are you sure you want to regenerate all resources? This will replace all existing resources on the map.";
    $("#alert").dialog({
      resizable: false,
      title: "Regenerate All Resources",
      buttons: {
        Regenerate: function () {
          Resources.generate();
          redrawResourcesLayer();
          refreshResourcesEditor();
          $(this).dialog("close");
        },
        Cancel: function () {
          $(this).dialog("close");
        }
      }
    });
  }

  function regenerateResourceType(el) {
    const key = el.dataset.key;
    const resource = Resources.RESOURCE_TYPES[key];
    if (!resource) return;
    
    Resources.generate(key);
    redrawResourcesLayer();
    refreshResourcesEditor();
    tip(`Regenerated ${resource.name} resources`);
  }

  function downloadResourcesData() {
    let data = "Resource,Color,Tiles,Total Amount,Pop Required,Max Output,Base Value\n";

    body.querySelectorAll(":scope > div").forEach(function (el) {
      const key = el.dataset.key;
      const resource = Resources.RESOURCE_TYPES[key];
      data += resource.name + ",";
      data += resource.color + ",";
      data += el.dataset.cells + ",";
      data += el.dataset.amount + ",";
      data += resource.popRequired + ",";
      data += resource.maxOutput + ",";
      data += resource.baseValue + "\n";
    });

    const name = getFileName("Resources") + ".csv";
    downloadFile(data, name);
  }

  function enterResourcesCustomizationMode() {
    if (!layerIsOn("toggleResources")) toggleResources();
    customization = 7;
    
    document.querySelectorAll("#resourcesBottom > button").forEach(el => (el.style.display = "none"));
    document.querySelectorAll("#resourcesBottom > div").forEach(el => (el.style.display = "block"));
    
    const firstResource = body.querySelector("div.resources");
    if (firstResource) firstResource.classList.add("selected");

    resourcesEditor.querySelectorAll(".hide").forEach(el => el.classList.add("hidden"));
    body.querySelectorAll("div > input, select, span, svg").forEach(e => (e.style.pointerEvents = "none"));
    resourcesFooter.style.display = "none";
    $("#resourcesEditor").dialog({position: {my: "right top", at: "right-10 top+10", of: "svg"}});

    tip("Click on map to place selected resource, Ctrl+click to remove resource", true);
    viewbox
      .style("cursor", "crosshair")
      .on("click", placeResourceOnMapClick)
      .call(d3.drag().on("start", dragResourceBrush))
      .on("touchmove mousemove", moveResourceBrush);
  }

  function selectResourceOnLineClick(el) {
    const line = el.closest("div.resources");
    if (!line) return;
    
    const selected = body.querySelector("div.selected");
    if (selected) selected.classList.remove("selected");
    line.classList.add("selected");
  }

  function placeResourceOnMapClick() {
    const point = d3.mouse(this);
    const i = findCell(point[0], point[1]);
    if (pack.cells.h[i] < 20) {
      tip("Cannot place resources on water", false, "error");
      return;
    }

    const selected = body.querySelector("div.selected");
    if (!selected) return;
    
    const key = selected.dataset.key;
    
    if (d3.event.ctrlKey || d3.event.metaKey) {
      Resources.removeResource(i);
    } else {
      Resources.setResource(i, key, 1 + Math.random());
    }
    
    redrawResourcesLayer();
  }

  function dragResourceBrush() {
    const r = +resourcesBrush.value;

    d3.event.on("drag", () => {
      if (!d3.event.dx && !d3.event.dy) return;
      const p = d3.mouse(this);
      moveCircle(p[0], p[1], r);

      const found = r > 5 ? findAll(p[0], p[1], r) : [findCell(p[0], p[1])];
      const selection = found.filter(isLand);
      if (selection.length) changeResourceForSelection(selection);
    });
  }

  function changeResourceForSelection(selection) {
    const selected = body.querySelector("div.selected");
    if (!selected) return;

    const key = selected.dataset.key;
    const ctrlPressed = d3.event.sourceEvent && (d3.event.sourceEvent.ctrlKey || d3.event.sourceEvent.metaKey);

    selection.forEach(function (i) {
      if (ctrlPressed) {
        Resources.removeResource(i);
      } else {
        Resources.setResource(i, key, 1 + Math.random());
      }
    });
    
    redrawResourcesLayer();
  }

  function moveResourceBrush() {
    showMainTip();
    const point = d3.mouse(this);
    const radius = +resourcesBrush.value;
    moveCircle(point[0], point[1], radius);
  }

  function applyResourcesChange() {
    redrawResourcesLayer();
    refreshResourcesEditor();
    exitResourcesCustomizationMode();
  }

  function exitResourcesCustomizationMode(close) {
    customization = 0;
    removeCircle();

    document.querySelectorAll("#resourcesBottom > button").forEach(el => (el.style.display = "inline-block"));
    document.querySelectorAll("#resourcesBottom > div").forEach(el => (el.style.display = "none"));

    body.querySelectorAll("div > input, select, span, svg").forEach(e => (e.style.pointerEvents = "all"));
    resourcesEditor.querySelectorAll(".hide").forEach(el => el.classList.remove("hidden"));
    resourcesFooter.style.display = "block";
    if (!close) $("#resourcesEditor").dialog({position: {my: "right top", at: "right-10 top+10", of: "svg"}});

    restoreDefaultEvents();
    clearMainTip();
    const selected = document.querySelector("#resourcesBody > div.selected");
    if (selected) selected.classList.remove("selected");
  }

  function closeResourcesEditor() {
    exitResourcesCustomizationMode("close");
  }
}
