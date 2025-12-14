"use strict";

const Economy = (function () {
  let economyData = null;
  let currentTurn = 0;

  function initialize() {
    if (economyData) return;

    economyData = {
      turn: 0,
      cellResources: new Map(),
      cellImprovements: new Map(),
      stateEconomies: new Map(),
      revealedResources: new Set(),
      tradeDeals: []
    };

    generateResources();
    initializeStateEconomies();
    autoImproveResources();

    console.log("Economy system initialized");
    return economyData;
  }

  function autoImproveResources() {
    const cells = pack.cells;
    
    for (const [cellId, cellResource] of economyData.cellResources) {
      const stateId = cells.state[cellId];
      if (!stateId || stateId === 0) continue;
      
      const resourceDef = EconomyConfig.RESOURCES[cellResource.resourceId];
      if (!resourceDef) continue;
      
      if (resourceDef.revealTech) {
        const stateEcon = economyData.stateEconomies.get(stateId);
        if (!stateEcon || !stateEcon.knownTech.has(resourceDef.revealTech)) continue;
      }
      
      const hasBurgNearby = cells.burg[cellId] > 0 || 
        (cells.c[cellId] || []).some(n => cells.burg[n] > 0);
      
      if (hasBurgNearby && resourceDef.improvementRequired) {
        cellResource.improved = true;
        cellResource.improvementId = resourceDef.improvementRequired;
        economyData.cellImprovements.set(cellId, resourceDef.improvementRequired);
      }
    }
    
    console.log(`Auto-improved ${economyData.cellImprovements.size} resources`);
  }

  function reset() {
    economyData = null;
    currentTurn = 0;
    initialize();
  }

  function generateResources() {
    const cells = pack.cells;
    const resources = EconomyConfig.RESOURCES;
    const density = EconomyConfig.RESOURCE_SPAWN_DENSITY;
    
    economyData.cellResources.clear();
    
    const seed = pack.seed || Date.now();
    const rng = new Alea(seed + "_economy");

    for (let cellId = 0; cellId < cells.i.length; cellId++) {
      const height = cells.h[cellId];
      const biome = cells.biome[cellId];

      for (const [resourceId, resourceDef] of Object.entries(resources)) {
        const rules = resourceDef.spawnRules;
        
        if (!rules.allowedBiomes.includes(biome)) continue;
        if (height < rules.minHeight || height > rules.maxHeight) continue;

        const spawnChance = rules.rarityWeight * density;
        
        if (rules.clustering) {
          const neighbors = cells.c[cellId] || [];
          const hasNearbyResource = neighbors.some(n => {
            const nr = economyData.cellResources.get(n);
            return nr && nr.resourceId === resourceId;
          });
          
          if (hasNearbyResource && rng() < spawnChance * 3) {
            economyData.cellResources.set(cellId, {
              resourceId,
              improved: false,
              improvementId: null
            });
            break;
          }
        }

        if (rng() < spawnChance) {
          economyData.cellResources.set(cellId, {
            resourceId,
            improved: false,
            improvementId: null
          });
          break;
        }
      }
    }

    console.log(`Generated ${economyData.cellResources.size} resource deposits`);
  }

  function initializeStateEconomies() {
    economyData.stateEconomies.clear();
    
    if (!pack.states) return;

    for (const state of pack.states) {
      if (!state || state.removed) continue;
      
      economyData.stateEconomies.set(state.i, {
        stateId: state.i,
        knownTech: new Set(["bronze_working", "animal_husbandry"]),
        strategicStockpiles: {},
        strategicCaps: {},
        luxuryUniquesOwned: new Set(),
        yields: {food: 0, production: 0, gold: 0, science: 0},
        amenitiesTotal: 0,
        population: 0
      });

      for (const [resourceId, resourceDef] of Object.entries(EconomyConfig.RESOURCES)) {
        if (resourceDef.category === "strategic") {
          const stateEcon = economyData.stateEconomies.get(state.i);
          stateEcon.strategicStockpiles[resourceId] = 0;
          stateEcon.strategicCaps[resourceId] = resourceDef.baseCap || 20;
        }
      }
    }
  }

  function processTurn() {
    if (!economyData) initialize();
    
    currentTurn++;
    economyData.turn = currentTurn;

    for (const [stateId, stateEcon] of economyData.stateEconomies) {
      processStateIncome(stateId, stateEcon);
      computeAmenities(stateId, stateEcon);
      computeYields(stateId, stateEcon);
    }

    processTradeDeals();
    
    console.log(`Turn ${currentTurn} processed`);
    return getTurnSummary();
  }

  function processStateIncome(stateId, stateEcon) {
    const cells = pack.cells;
    const income = {};
    const consumption = {};

    for (const [resourceId, resourceDef] of Object.entries(EconomyConfig.RESOURCES)) {
      if (resourceDef.category === "strategic") {
        income[resourceId] = 0;
        consumption[resourceId] = 0;
      }
    }

    for (const [cellId, cellResource] of economyData.cellResources) {
      if (cells.state[cellId] !== stateId) continue;
      if (!cellResource.improved) continue;

      const resourceDef = EconomyConfig.RESOURCES[cellResource.resourceId];
      if (!resourceDef) continue;

      if (resourceDef.category === "strategic" && resourceDef.perTurnIncome) {
        income[cellResource.resourceId] = (income[cellResource.resourceId] || 0) + resourceDef.perTurnIncome;
      }

      if (resourceDef.category === "luxury") {
        stateEcon.luxuryUniquesOwned.add(cellResource.resourceId);
      }
    }

    for (const resourceId of Object.keys(income)) {
      const netChange = income[resourceId] - consumption[resourceId];
      const current = stateEcon.strategicStockpiles[resourceId] || 0;
      const cap = stateEcon.strategicCaps[resourceId] || 20;
      
      stateEcon.strategicStockpiles[resourceId] = Math.max(0, Math.min(cap, current + netChange));
    }
  }

  function computeAmenities(stateId, stateEcon) {
    let amenities = 0;

    for (const luxuryId of stateEcon.luxuryUniquesOwned) {
      const resourceDef = EconomyConfig.RESOURCES[luxuryId];
      if (resourceDef && resourceDef.amenityValue) {
        amenities += resourceDef.amenityValue;
      } else {
        amenities += EconomyConfig.LUXURY_BASE_AMENITY;
      }
    }

    stateEcon.amenitiesTotal = amenities;
  }

  function computeYields(stateId, stateEcon) {
    const cells = pack.cells;
    const yields = {food: 0, production: 0, gold: 0, science: 0};

    for (let cellId = 0; cellId < cells.i.length; cellId++) {
      if (cells.state[cellId] !== stateId) continue;
      if (cells.h[cellId] < 20) continue;

      yields.food += 1;
      yields.production += 0.5;

      const cellResource = economyData.cellResources.get(cellId);
      if (cellResource && cellResource.improved) {
        const resourceDef = EconomyConfig.RESOURCES[cellResource.resourceId];
        if (resourceDef && resourceDef.tileYieldDelta) {
          const delta = resourceDef.tileYieldDelta;
          yields.food += delta.food || 0;
          yields.production += delta.production || 0;
          yields.gold += delta.gold || 0;
          yields.science += delta.science || 0;
        }
      }
    }

    const amenityBonus = 1 + (stateEcon.amenitiesTotal * 0.02);
    yields.gold *= amenityBonus;
    yields.production *= amenityBonus;

    stateEcon.yields = yields;
  }

  function processTradeDeals() {
    const currentDeals = economyData.tradeDeals.filter(deal => {
      if (deal.expiryTurn && deal.expiryTurn <= currentTurn) {
        return false;
      }
      return true;
    });
    
    economyData.tradeDeals = currentDeals;

    for (const deal of economyData.tradeDeals) {
      const fromEcon = economyData.stateEconomies.get(deal.fromStateId);
      const toEcon = economyData.stateEconomies.get(deal.toStateId);
      
      if (!fromEcon || !toEcon) continue;

      const resourceDef = EconomyConfig.RESOURCES[deal.resourceId];
      if (!resourceDef) continue;

      if (resourceDef.category === "luxury") {
        toEcon.luxuryUniquesOwned.add(deal.resourceId);
      }
    }
  }

  function buildImprovement(cellId, improvementId) {
    const cellResource = economyData.cellResources.get(cellId);
    if (!cellResource) return {success: false, message: "No resource at this cell"};

    const resourceDef = EconomyConfig.RESOURCES[cellResource.resourceId];
    if (!resourceDef) return {success: false, message: "Unknown resource"};

    if (resourceDef.improvementRequired && resourceDef.improvementRequired !== improvementId) {
      return {success: false, message: `This resource requires ${resourceDef.improvementRequired}`};
    }

    const improvement = EconomyConfig.IMPROVEMENTS[improvementId];
    if (!improvement) return {success: false, message: "Unknown improvement"};

    if (!improvement.validResources.includes(cellResource.resourceId)) {
      return {success: false, message: "This improvement cannot be built on this resource"};
    }

    cellResource.improved = true;
    cellResource.improvementId = improvementId;
    economyData.cellImprovements.set(cellId, improvementId);

    return {success: true, message: `Built ${improvement.name}`};
  }

  function unlockTech(stateId, techId) {
    const stateEcon = economyData.stateEconomies.get(stateId);
    if (!stateEcon) return {success: false, message: "State not found"};

    const tech = EconomyConfig.TECHS[techId];
    if (!tech) return {success: false, message: "Unknown technology"};

    stateEcon.knownTech.add(techId);

    if (tech.revealsResources) {
      for (const resourceId of tech.revealsResources) {
        economyData.revealedResources.add(resourceId);
      }
    }

    return {success: true, message: `Unlocked ${tech.name}`};
  }

  function canSeeResource(stateId, resourceId) {
    const resourceDef = EconomyConfig.RESOURCES[resourceId];
    if (!resourceDef) return false;

    if (!resourceDef.revealTech) return true;

    const stateEcon = economyData.stateEconomies.get(stateId);
    if (!stateEcon) return false;

    return stateEcon.knownTech.has(resourceDef.revealTech);
  }

  function getVisibleResources(stateId) {
    const visible = [];
    
    for (const [cellId, cellResource] of economyData.cellResources) {
      if (canSeeResource(stateId, cellResource.resourceId)) {
        visible.push({
          cellId,
          ...cellResource,
          resourceDef: EconomyConfig.RESOURCES[cellResource.resourceId]
        });
      }
    }

    return visible;
  }

  function spendStrategic(stateId, costs) {
    const stateEcon = economyData.stateEconomies.get(stateId);
    if (!stateEcon) return {success: false, message: "State not found"};

    for (const [resourceId, amount] of Object.entries(costs)) {
      const current = stateEcon.strategicStockpiles[resourceId] || 0;
      if (current < amount) {
        return {success: false, message: `Insufficient ${resourceId}: have ${current}, need ${amount}`};
      }
    }

    for (const [resourceId, amount] of Object.entries(costs)) {
      stateEcon.strategicStockpiles[resourceId] -= amount;
    }

    return {success: true, message: "Resources spent"};
  }

  function createTradeDeal(fromStateId, toStateId, resourceId, durationTurns) {
    const fromEcon = economyData.stateEconomies.get(fromStateId);
    if (!fromEcon) return {success: false, message: "Sender state not found"};

    const resourceDef = EconomyConfig.RESOURCES[resourceId];
    if (!resourceDef) return {success: false, message: "Unknown resource"};

    if (resourceDef.category === "luxury") {
      if (!fromEcon.luxuryUniquesOwned.has(resourceId)) {
        return {success: false, message: "Sender doesn't have this luxury"};
      }
    }

    const deal = {
      id: Date.now(),
      fromStateId,
      toStateId,
      resourceId,
      createdTurn: currentTurn,
      expiryTurn: durationTurns ? currentTurn + durationTurns : null
    };

    economyData.tradeDeals.push(deal);

    return {success: true, message: "Trade deal created", deal};
  }

  function getStateResourceSummary(stateId) {
    const stateEcon = economyData.stateEconomies.get(stateId);
    if (!stateEcon) return null;

    const cells = pack.cells;
    const summary = {
      strategic: {},
      luxury: {unique: [], duplicates: []},
      bonus: [],
      yields: stateEcon.yields,
      amenities: stateEcon.amenitiesTotal
    };

    const luxuryCounts = {};
    const bonusCounts = {};

    for (const [cellId, cellResource] of economyData.cellResources) {
      if (cells.state[cellId] !== stateId) continue;
      if (!cellResource.improved) continue;

      const resourceDef = EconomyConfig.RESOURCES[cellResource.resourceId];
      if (!resourceDef) continue;

      if (resourceDef.category === "strategic") {
        if (!summary.strategic[cellResource.resourceId]) {
          summary.strategic[cellResource.resourceId] = {
            income: 0,
            upkeep: 0,
            stockpile: stateEcon.strategicStockpiles[cellResource.resourceId] || 0,
            cap: stateEcon.strategicCaps[cellResource.resourceId] || 20,
            sources: []
          };
        }
        summary.strategic[cellResource.resourceId].income += resourceDef.perTurnIncome || 0;
        summary.strategic[cellResource.resourceId].sources.push(cellId);
      } else if (resourceDef.category === "luxury") {
        luxuryCounts[cellResource.resourceId] = (luxuryCounts[cellResource.resourceId] || 0) + 1;
      } else if (resourceDef.category === "bonus") {
        bonusCounts[cellResource.resourceId] = (bonusCounts[cellResource.resourceId] || 0) + 1;
      }
    }

    for (const [luxuryId, count] of Object.entries(luxuryCounts)) {
      const resourceDef = EconomyConfig.RESOURCES[luxuryId];
      if (count === 1) {
        summary.luxury.unique.push({id: luxuryId, name: resourceDef.name, amenity: resourceDef.amenityValue || EconomyConfig.LUXURY_BASE_AMENITY});
      } else {
        summary.luxury.unique.push({id: luxuryId, name: resourceDef.name, amenity: resourceDef.amenityValue || EconomyConfig.LUXURY_BASE_AMENITY});
        summary.luxury.duplicates.push({id: luxuryId, name: resourceDef.name, count: count - 1});
      }
    }

    for (const [bonusId, count] of Object.entries(bonusCounts)) {
      const resourceDef = EconomyConfig.RESOURCES[bonusId];
      summary.bonus.push({id: bonusId, name: resourceDef.name, count, yieldBonus: resourceDef.tileYieldDelta});
    }

    return summary;
  }

  function getTurnSummary() {
    const summaries = {};
    
    for (const [stateId, stateEcon] of economyData.stateEconomies) {
      const state = pack.states[stateId];
      if (!state || state.removed) continue;

      summaries[stateId] = {
        stateName: state.name,
        turn: currentTurn,
        ...getStateResourceSummary(stateId)
      };
    }

    return {turn: currentTurn, states: summaries};
  }

  function getData() {
    return economyData;
  }

  function getTurn() {
    return currentTurn;
  }

  function getAllResources() {
    return EconomyConfig.RESOURCES;
  }

  function getAllImprovements() {
    return EconomyConfig.IMPROVEMENTS;
  }

  function getCellResource(cellId) {
    if (!economyData) return null;
    return economyData.cellResources.get(cellId);
  }

  function getStateEconomy(stateId) {
    if (!economyData) return null;
    return economyData.stateEconomies.get(stateId);
  }

  return {
    initialize,
    reset,
    processTurn,
    buildImprovement,
    unlockTech,
    canSeeResource,
    getVisibleResources,
    spendStrategic,
    createTradeDeal,
    getStateResourceSummary,
    getTurnSummary,
    getData,
    getTurn,
    getAllResources,
    getAllImprovements,
    getCellResource,
    getStateEconomy,
    generateResources
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = Economy;
}
