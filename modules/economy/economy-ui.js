"use strict";

const EconomyUI = (function () {
  let isInitialized = false;
  let selectedStateId = null;

  function initialize() {
    if (isInitialized) return;
    
    createUI();
    addEventListeners();
    isInitialized = true;
    
    console.log("Economy UI initialized");
  }

  function createUI() {
    const economyPanel = document.createElement("div");
    economyPanel.id = "economyPanel";
    economyPanel.className = "dialog";
    economyPanel.innerHTML = `
      <div id="economyHeader">
        <span id="economyTurnDisplay">Turn: 0</span>
        <button id="economyNextTurn" class="economy-btn">Next Turn</button>
        <button id="economyAutoPlay" class="economy-btn">Auto Play</button>
      </div>
      
      <div id="economyStateSelector">
        <label for="economyStateSelect">View State:</label>
        <select id="economyStateSelect"></select>
      </div>
      
      <div id="economyTabs">
        <button class="economy-tab active" data-tab="overview">Overview</button>
        <button class="economy-tab" data-tab="strategic">Strategic</button>
        <button class="economy-tab" data-tab="luxury">Luxury</button>
        <button class="economy-tab" data-tab="tech">Tech</button>
      </div>
      
      <div id="economyContent">
        <div id="economyOverview" class="economy-tab-content active">
          <div id="economyYields"></div>
          <div id="economyAmenities"></div>
          <div id="economyQuickStats"></div>
        </div>
        
        <div id="economyStrategic" class="economy-tab-content">
          <div id="strategicResourcesList"></div>
        </div>
        
        <div id="economyLuxury" class="economy-tab-content">
          <div id="luxuryUniqueList"></div>
          <div id="luxuryDuplicateList"></div>
        </div>
        
        <div id="economyTech" class="economy-tab-content">
          <div id="techTreeList"></div>
        </div>
      </div>
      
      <div id="economyActions">
        <button id="economyShowResources" class="economy-btn">Toggle Resources</button>
        <button id="economyReset" class="economy-btn">Reset Economy</button>
      </div>
    `;
    
    document.body.appendChild(economyPanel);
    
    addStyles();
  }

  function addStyles() {
    const style = document.createElement("style");
    style.id = "economyStyles";
    style.textContent = `
      #economyPanel {
        position: fixed;
        right: 10px;
        top: 60px;
        width: 320px;
        max-height: 80vh;
        background: rgba(255, 255, 255, 0.95);
        border: 1px solid #666;
        border-radius: 5px;
        padding: 10px;
        z-index: 1000;
        font-size: 12px;
        overflow-y: auto;
        display: none;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      }
      
      #economyPanel.visible {
        display: block;
      }
      
      #economyHeader {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        padding-bottom: 10px;
        border-bottom: 1px solid #ccc;
      }
      
      #economyTurnDisplay {
        font-weight: bold;
        font-size: 14px;
      }
      
      .economy-btn {
        padding: 5px 10px;
        background: #4a90d9;
        color: white;
        border: none;
        border-radius: 3px;
        cursor: pointer;
        font-size: 11px;
      }
      
      .economy-btn:hover {
        background: #357abd;
      }
      
      .economy-btn:disabled {
        background: #999;
        cursor: not-allowed;
      }
      
      #economyStateSelector {
        margin-bottom: 10px;
      }
      
      #economyStateSelect {
        width: 100%;
        padding: 5px;
        margin-top: 5px;
      }
      
      #economyTabs {
        display: flex;
        gap: 5px;
        margin-bottom: 10px;
      }
      
      .economy-tab {
        flex: 1;
        padding: 8px 5px;
        background: #eee;
        border: 1px solid #ccc;
        border-radius: 3px 3px 0 0;
        cursor: pointer;
        font-size: 11px;
      }
      
      .economy-tab.active {
        background: #4a90d9;
        color: white;
        border-color: #4a90d9;
      }
      
      .economy-tab-content {
        display: none;
        padding: 10px;
        background: #f9f9f9;
        border: 1px solid #ddd;
        border-radius: 0 0 3px 3px;
        min-height: 200px;
      }
      
      .economy-tab-content.active {
        display: block;
      }
      
      .resource-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px;
        margin: 5px 0;
        background: white;
        border: 1px solid #ddd;
        border-radius: 3px;
      }
      
      .resource-icon {
        font-size: 18px;
        margin-right: 8px;
      }
      
      .resource-name {
        font-weight: bold;
        flex: 1;
      }
      
      .resource-value {
        text-align: right;
        font-family: monospace;
      }
      
      .stockpile-bar {
        width: 100px;
        height: 10px;
        background: #ddd;
        border-radius: 5px;
        overflow: hidden;
        margin-left: 10px;
      }
      
      .stockpile-fill {
        height: 100%;
        background: #4a90d9;
        transition: width 0.3s;
      }
      
      .yield-row {
        display: flex;
        justify-content: space-between;
        padding: 5px 0;
        border-bottom: 1px solid #eee;
      }
      
      .yield-label {
        display: flex;
        align-items: center;
        gap: 5px;
      }
      
      .positive {
        color: #2d8a2d;
      }
      
      .negative {
        color: #d9534f;
      }
      
      .amenity-box {
        text-align: center;
        padding: 15px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 5px;
        margin: 10px 0;
      }
      
      .amenity-value {
        font-size: 24px;
        font-weight: bold;
      }
      
      .tech-item {
        padding: 10px;
        margin: 5px 0;
        background: white;
        border: 1px solid #ddd;
        border-radius: 3px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .tech-item.unlocked {
        background: #d4edda;
        border-color: #c3e6cb;
      }
      
      .tech-item.locked {
        opacity: 0.7;
      }
      
      .luxury-section {
        margin-bottom: 15px;
      }
      
      .luxury-section h4 {
        margin: 0 0 10px 0;
        padding-bottom: 5px;
        border-bottom: 1px solid #ddd;
      }
      
      #economyActions {
        margin-top: 15px;
        padding-top: 10px;
        border-top: 1px solid #ccc;
        display: flex;
        gap: 10px;
      }
      
      #economyActions .economy-btn {
        flex: 1;
      }
      
      .quick-stat {
        display: inline-block;
        padding: 8px 12px;
        margin: 5px;
        background: #e9ecef;
        border-radius: 20px;
        font-size: 11px;
      }
    `;
    document.head.appendChild(style);
  }

  function addEventListeners() {
    document.getElementById("economyNextTurn").addEventListener("click", handleNextTurn);
    document.getElementById("economyAutoPlay").addEventListener("click", handleAutoPlay);
    document.getElementById("economyStateSelect").addEventListener("change", handleStateChange);
    document.getElementById("economyShowResources").addEventListener("click", toggleResourceLayer);
    document.getElementById("economyReset").addEventListener("click", handleReset);

    document.querySelectorAll(".economy-tab").forEach(tab => {
      tab.addEventListener("click", handleTabClick);
    });
  }

  function handleNextTurn() {
    const summary = Economy.processTurn();
    updateUI();
    showTurnNotification(summary.turn);
  }

  let autoPlayInterval = null;
  function handleAutoPlay() {
    const btn = document.getElementById("economyAutoPlay");
    
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
      autoPlayInterval = null;
      btn.textContent = "Auto Play";
      btn.classList.remove("active");
    } else {
      autoPlayInterval = setInterval(() => {
        handleNextTurn();
      }, 1500);
      btn.textContent = "Stop";
      btn.classList.add("active");
    }
  }

  function handleStateChange(e) {
    selectedStateId = parseInt(e.target.value);
    updateStateView();
  }

  function handleTabClick(e) {
    document.querySelectorAll(".economy-tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".economy-tab-content").forEach(c => c.classList.remove("active"));
    
    e.target.classList.add("active");
    const tabId = e.target.dataset.tab;
    document.getElementById("economy" + tabId.charAt(0).toUpperCase() + tabId.slice(1)).classList.add("active");
  }

  function toggleResourceLayer() {
    EconomyRenderer.toggle();
  }

  function handleReset() {
    if (confirm("Reset the economy? This will regenerate all resources and reset all stockpiles.")) {
      Economy.reset();
      updateUI();
    }
  }

  function showTurnNotification(turn) {
    const notification = document.createElement("div");
    notification.className = "turn-notification";
    notification.textContent = `Turn ${turn}`;
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 20px 40px;
      border-radius: 10px;
      font-size: 24px;
      z-index: 10000;
      animation: fadeOut 1s forwards;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 1000);
  }

  function updateUI() {
    updateTurnDisplay();
    updateStateSelector();
    updateStateView();
  }

  function updateTurnDisplay() {
    const turn = Economy.getTurn();
    document.getElementById("economyTurnDisplay").textContent = `Turn: ${turn}`;
  }

  function updateStateSelector() {
    const select = document.getElementById("economyStateSelect");
    select.innerHTML = "";
    
    if (!pack.states) return;
    
    for (const state of pack.states) {
      if (!state || state.removed || state.i === 0) continue;
      const option = document.createElement("option");
      option.value = state.i;
      option.textContent = state.name;
      select.appendChild(option);
    }
    
    if (!selectedStateId && pack.states.length > 1) {
      selectedStateId = pack.states.find(s => s && !s.removed && s.i !== 0)?.i;
    }
    
    if (selectedStateId) {
      select.value = selectedStateId;
    }
  }

  function updateStateView() {
    if (!selectedStateId) return;
    
    const summary = Economy.getStateResourceSummary(selectedStateId);
    if (!summary) return;
    
    updateOverviewTab(summary);
    updateStrategicTab(summary);
    updateLuxuryTab(summary);
    updateTechTab();
  }

  function updateOverviewTab(summary) {
    const yieldsHtml = `
      <h4>Yields Per Turn</h4>
      <div class="yield-row">
        <span class="yield-label">🍞 Food</span>
        <span class="positive">+${Math.round(summary.yields.food)}</span>
      </div>
      <div class="yield-row">
        <span class="yield-label">⚙️ Production</span>
        <span class="positive">+${Math.round(summary.yields.production)}</span>
      </div>
      <div class="yield-row">
        <span class="yield-label">💰 Gold</span>
        <span class="positive">+${Math.round(summary.yields.gold)}</span>
      </div>
      <div class="yield-row">
        <span class="yield-label">🔬 Science</span>
        <span class="positive">+${Math.round(summary.yields.science)}</span>
      </div>
    `;
    document.getElementById("economyYields").innerHTML = yieldsHtml;
    
    const amenityHtml = `
      <div class="amenity-box">
        <div>Amenities</div>
        <div class="amenity-value">${summary.amenities}</div>
        <div style="font-size: 11px; opacity: 0.9">+${(summary.amenities * 2)}% yield bonus</div>
      </div>
    `;
    document.getElementById("economyAmenities").innerHTML = amenityHtml;
    
    const strategicCount = Object.keys(summary.strategic).length;
    const luxuryCount = summary.luxury.unique.length;
    const bonusCount = summary.bonus.length;
    
    const quickStatsHtml = `
      <div class="quick-stat">⚔️ ${strategicCount} Strategic</div>
      <div class="quick-stat">💎 ${luxuryCount} Luxury</div>
      <div class="quick-stat">📦 ${bonusCount} Bonus</div>
    `;
    document.getElementById("economyQuickStats").innerHTML = quickStatsHtml;
  }

  function updateStrategicTab(summary) {
    const container = document.getElementById("strategicResourcesList");
    
    if (Object.keys(summary.strategic).length === 0) {
      container.innerHTML = "<p>No strategic resources being produced. Build improvements on resource tiles to activate them.</p>";
      return;
    }
    
    let html = "";
    for (const [resourceId, data] of Object.entries(summary.strategic)) {
      const resourceDef = EconomyConfig.RESOURCES[resourceId];
      const netChange = data.income - data.upkeep;
      const fillPercent = (data.stockpile / data.cap) * 100;
      
      html += `
        <div class="resource-item">
          <span class="resource-icon">${resourceDef.icon}</span>
          <span class="resource-name">${resourceDef.name}</span>
          <div class="resource-value">
            <div>${data.stockpile}/${data.cap}</div>
            <div class="${netChange >= 0 ? 'positive' : 'negative'}">
              ${netChange >= 0 ? '+' : ''}${netChange}/turn
            </div>
            <div class="stockpile-bar">
              <div class="stockpile-fill" style="width: ${fillPercent}%"></div>
            </div>
          </div>
        </div>
      `;
    }
    
    container.innerHTML = html;
  }

  function updateLuxuryTab(summary) {
    const uniqueContainer = document.getElementById("luxuryUniqueList");
    const duplicateContainer = document.getElementById("luxuryDuplicateList");
    
    let uniqueHtml = "<div class='luxury-section'><h4>💎 Unique Luxuries (Providing Amenities)</h4>";
    if (summary.luxury.unique.length === 0) {
      uniqueHtml += "<p>No luxury resources owned.</p>";
    } else {
      for (const luxury of summary.luxury.unique) {
        const resourceDef = EconomyConfig.RESOURCES[luxury.id];
        uniqueHtml += `
          <div class="resource-item">
            <span class="resource-icon">${resourceDef.icon}</span>
            <span class="resource-name">${luxury.name}</span>
            <span class="resource-value positive">+${luxury.amenity} Amenities</span>
          </div>
        `;
      }
    }
    uniqueHtml += "</div>";
    uniqueContainer.innerHTML = uniqueHtml;
    
    let duplicateHtml = "<div class='luxury-section'><h4>📦 Duplicate Luxuries (Trade Value)</h4>";
    if (summary.luxury.duplicates.length === 0) {
      duplicateHtml += "<p>No duplicate luxuries available for trade.</p>";
    } else {
      for (const dup of summary.luxury.duplicates) {
        const resourceDef = EconomyConfig.RESOURCES[dup.id];
        duplicateHtml += `
          <div class="resource-item">
            <span class="resource-icon">${resourceDef.icon}</span>
            <span class="resource-name">${dup.name}</span>
            <span class="resource-value">x${dup.count} available</span>
          </div>
        `;
      }
    }
    duplicateHtml += "</div>";
    duplicateContainer.innerHTML = duplicateHtml;
  }

  function updateTechTab() {
    const stateEcon = Economy.getStateEconomy(selectedStateId);
    if (!stateEcon) return;
    
    const container = document.getElementById("techTreeList");
    let html = "<h4>🔬 Technologies</h4>";
    
    for (const [techId, tech] of Object.entries(EconomyConfig.TECHS)) {
      const isUnlocked = stateEcon.knownTech.has(techId);
      const revealsText = tech.revealsResources.map(r => {
        const res = EconomyConfig.RESOURCES[r];
        return res ? `${res.icon} ${res.name}` : r;
      }).join(", ");
      
      html += `
        <div class="tech-item ${isUnlocked ? 'unlocked' : 'locked'}">
          <div>
            <strong>${tech.name}</strong>
            <div style="font-size: 10px; color: #666">Reveals: ${revealsText}</div>
          </div>
          ${isUnlocked ? 
            '<span style="color: #28a745">✓ Unlocked</span>' : 
            `<button class="economy-btn" onclick="EconomyUI.unlockTech('${techId}')">Research (${tech.cost})</button>`
          }
        </div>
      `;
    }
    
    container.innerHTML = html;
  }

  function unlockTech(techId) {
    if (!selectedStateId) return;
    
    const result = Economy.unlockTech(selectedStateId, techId);
    if (result.success) {
      updateUI();
      EconomyRenderer.render();
    }
  }

  function show() {
    Economy.initialize();
    document.getElementById("economyPanel").classList.add("visible");
    updateUI();
    EconomyRenderer.render();
  }

  function hide() {
    document.getElementById("economyPanel").classList.remove("visible");
    EconomyRenderer.hide();
  }

  function toggle() {
    const panel = document.getElementById("economyPanel");
    if (panel.classList.contains("visible")) {
      hide();
    } else {
      show();
    }
  }

  return {
    initialize,
    show,
    hide,
    toggle,
    updateUI,
    unlockTech
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = EconomyUI;
}
