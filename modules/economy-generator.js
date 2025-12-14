"use strict";

window.Economy = (function () {
  let currentTurn = 0;
  let economyData = null;

  const TRADE_RANGE = 5;
  const PRODUCTION_MULTIPLIER = 1.0;
  const CONSUMPTION_RATE = 0.8;

  function initialize() {
    TIME && console.time("initializeEconomy");
    
    const {cells, burgs, states} = pack;
    const n = cells.i.length;
    
    cells.wealth = new Float32Array(n);
    cells.production = new Float32Array(n);
    cells.trade = new Float32Array(n);
    
    economyData = {
      turn: 0,
      states: {},
      burgs: {},
      tradeRoutes: [],
      totalWealth: 0,
      totalProduction: 0
    };
    
    for (let i = 0; i < n; i++) {
      if (cells.h[i] < 20) continue;
      
      const pop = cells.pop[i] || 0;
      const resourceId = cells.resource ? cells.resource[i] : 0;
      const resourceAmount = cells.resourceAmount ? cells.resourceAmount[i] : 0;
      
      let production = pop * 0.1 * PRODUCTION_MULTIPLIER;
      
      if (resourceId > 0 && resourceAmount > 0) {
        const resource = Resources.getResourceById(resourceId);
        if (resource) {
          production += resourceAmount * resource.baseValue * 0.5;
        }
      }
      
      cells.production[i] = production;
      cells.wealth[i] = production * 2;
    }
    
    states.forEach((state, i) => {
      if (i === 0 || !state.i) return;
      
      economyData.states[i] = {
        id: i,
        name: state.name,
        treasury: 0,
        income: 0,
        expenses: 0,
        tradeBalance: 0
      };
      
      let totalWealth = 0;
      let totalProduction = 0;
      
      for (let c = 0; c < n; c++) {
        if (cells.state[c] !== i) continue;
        totalWealth += cells.wealth[c];
        totalProduction += cells.production[c];
      }
      
      economyData.states[i].treasury = totalWealth * 0.1;
      economyData.states[i].income = totalProduction * 0.2;
    });
    
    burgs.forEach((burg, i) => {
      if (i === 0 || !burg.i) return;
      
      const cell = burg.cell;
      const pop = burg.population || cells.pop[cell] || 1;
      const isCapital = burg.capital;
      
      economyData.burgs[i] = {
        id: i,
        name: burg.name,
        wealth: cells.wealth[cell] * (isCapital ? 2 : 1),
        income: cells.production[cell] * 0.3,
        tradeVolume: 0,
        marketSize: pop * (isCapital ? 1.5 : 1)
      };
    });
    
    calculateTradeRoutes();
    
    economyData.totalWealth = Array.from(cells.wealth).reduce((a, b) => a + b, 0);
    economyData.totalProduction = Array.from(cells.production).reduce((a, b) => a + b, 0);
    
    currentTurn = 0;
    
    TIME && console.timeEnd("initializeEconomy");
  }

  function calculateTradeRoutes() {
    if (!economyData) return;
    
    const {burgs, cells} = pack;
    const tradeRoutes = [];
    
    const marketBurgs = burgs.filter((b, i) => i > 0 && b.i && economyData.burgs[i]);
    
    for (let i = 0; i < marketBurgs.length; i++) {
      const burg1 = marketBurgs[i];
      const burgData1 = economyData.burgs[burg1.i];
      
      for (let j = i + 1; j < marketBurgs.length; j++) {
        const burg2 = marketBurgs[j];
        const burgData2 = economyData.burgs[burg2.i];
        
        const [x1, y1] = burg1.cell ? cells.p[burg1.cell] : [0, 0];
        const [x2, y2] = burg2.cell ? cells.p[burg2.cell] : [0, 0];
        const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        
        const maxDistance = graphWidth * 0.3;
        if (distance > maxDistance) continue;
        
        const state1 = cells.state[burg1.cell];
        const state2 = cells.state[burg2.cell];
        const sameState = state1 === state2;
        
        const tradeValue = (burgData1.marketSize + burgData2.marketSize) * 
                          (1 - distance / maxDistance) * 
                          (sameState ? 1.2 : 0.8);
        
        if (tradeValue > 5) {
          tradeRoutes.push({
            from: burg1.i,
            to: burg2.i,
            fromCell: burg1.cell,
            toCell: burg2.cell,
            value: tradeValue,
            distance: distance,
            sameState: sameState
          });
          
          burgData1.tradeVolume += tradeValue;
          burgData2.tradeVolume += tradeValue;
        }
      }
    }
    
    economyData.tradeRoutes = tradeRoutes.sort((a, b) => b.value - a.value);
  }

  function advanceTurn() {
    if (!economyData) initialize();
    
    TIME && console.time("economyAdvanceTurn");
    
    currentTurn++;
    economyData.turn = currentTurn;
    
    const {cells, burgs} = pack;
    const n = cells.i.length;
    
    for (let i = 0; i < n; i++) {
      if (cells.h[i] < 20) continue;
      
      const production = cells.production[i];
      const consumed = production * CONSUMPTION_RATE;
      const surplus = production - consumed;
      
      cells.wealth[i] += surplus;
      cells.trade[i] = 0;
    }
    
    for (const route of economyData.tradeRoutes) {
      const tradeAmount = route.value * 0.1;
      
      cells.trade[route.fromCell] += tradeAmount;
      cells.trade[route.toCell] += tradeAmount;
      cells.wealth[route.fromCell] += tradeAmount * 0.5;
      cells.wealth[route.toCell] += tradeAmount * 0.5;
    }
    
    for (const stateId in economyData.states) {
      const stateData = economyData.states[stateId];
      
      let totalProduction = 0;
      let totalWealth = 0;
      
      for (let c = 0; c < n; c++) {
        if (cells.state[c] !== parseInt(stateId)) continue;
        totalProduction += cells.production[c];
        totalWealth += cells.wealth[c];
      }
      
      const taxRate = 0.15;
      const income = totalProduction * taxRate;
      const militaryCost = (pack.states[stateId]?.military || []).length * 10;
      const expenses = militaryCost + totalWealth * 0.02;
      
      stateData.income = income;
      stateData.expenses = expenses;
      stateData.treasury += income - expenses;
      stateData.tradeBalance = economyData.tradeRoutes
        .filter(r => cells.state[r.fromCell] === parseInt(stateId) || 
                     cells.state[r.toCell] === parseInt(stateId))
        .reduce((sum, r) => sum + r.value, 0);
    }
    
    for (const burgId in economyData.burgs) {
      const burgData = economyData.burgs[burgId];
      const burg = burgs[burgId];
      if (!burg || !burg.cell) continue;
      
      burgData.wealth = cells.wealth[burg.cell];
      burgData.income = cells.production[burg.cell] * 0.3;
    }
    
    economyData.totalWealth = Array.from(cells.wealth).reduce((a, b) => a + b, 0);
    economyData.totalProduction = Array.from(cells.production).reduce((a, b) => a + b, 0);
    
    TIME && console.timeEnd("economyAdvanceTurn");
    
    return economyData;
  }

  function getCurrentTurn() {
    return currentTurn;
  }

  function getEconomyData() {
    return economyData;
  }

  function getStateEconomy(stateId) {
    if (!economyData || !economyData.states[stateId]) return null;
    return economyData.states[stateId];
  }

  function getBurgEconomy(burgId) {
    if (!economyData || !economyData.burgs[burgId]) return null;
    return economyData.burgs[burgId];
  }

  function getTradeRoutes() {
    if (!economyData) return [];
    return economyData.tradeRoutes;
  }

  function getCellEconomy(cellId) {
    if (!pack.cells.wealth) return null;
    
    return {
      wealth: pack.cells.wealth[cellId],
      production: pack.cells.production[cellId],
      trade: pack.cells.trade[cellId]
    };
  }

  function loadEconomyData(savedData) {
    if (!savedData || savedData === "null") return;
    
    try {
      const parsed = typeof savedData === 'string' ? JSON.parse(savedData) : savedData;
      if (!parsed) return;
      
      economyData = parsed;
      currentTurn = parsed.turn || 0;
      
      const {cells} = pack;
      const n = cells.i.length;
      
      if (!cells.wealth) cells.wealth = new Float32Array(n);
      if (!cells.production) cells.production = new Float32Array(n);
      if (!cells.trade) cells.trade = new Float32Array(n);
      
    } catch (e) {
      console.error("Failed to load economy data:", e);
    }
  }

  return {
    initialize,
    advanceTurn,
    getCurrentTurn,
    getEconomyData,
    getStateEconomy,
    getBurgEconomy,
    getTradeRoutes,
    getCellEconomy,
    calculateTradeRoutes,
    loadEconomyData
  };
})();
