"use strict";

window.Resources = (function () {
  const RESOURCE_TYPES = {
    grain: {id: 1, name: "Grain", color: "#f4d03f", icon: "🌾", biomes: [5, 6, 7, 8], baseValue: 2, minHeight: 20, maxHeight: 50},
    timber: {id: 2, name: "Timber", color: "#27ae60", icon: "🌲", biomes: [4, 5, 6, 8, 9], baseValue: 3, minHeight: 20, maxHeight: 70},
    iron: {id: 3, name: "Iron", color: "#7f8c8d", icon: "⛏️", biomes: [3, 4, 5, 10, 11], baseValue: 8, minHeight: 40, maxHeight: 90},
    gold: {id: 4, name: "Gold", color: "#f1c40f", icon: "💰", biomes: [3, 10, 11], baseValue: 25, minHeight: 50, maxHeight: 90},
    fish: {id: 5, name: "Fish", color: "#3498db", icon: "🐟", biomes: [], baseValue: 3, coastal: true},
    stone: {id: 6, name: "Stone", color: "#95a5a6", icon: "🪨", biomes: [3, 10, 11, 12], baseValue: 4, minHeight: 30, maxHeight: 100},
    salt: {id: 7, name: "Salt", color: "#ecf0f1", icon: "🧂", biomes: [1, 2, 3], baseValue: 6, minHeight: 20, maxHeight: 40},
    gems: {id: 8, name: "Gems", color: "#9b59b6", icon: "💎", biomes: [10, 11, 12], baseValue: 40, minHeight: 60, maxHeight: 100},
    horses: {id: 9, name: "Horses", color: "#d35400", icon: "🐴", biomes: [5, 6, 7], baseValue: 15, minHeight: 20, maxHeight: 50},
    furs: {id: 10, name: "Furs", color: "#8b4513", icon: "🦊", biomes: [4, 9, 10, 11], baseValue: 10, minHeight: 20, maxHeight: 80},
    spices: {id: 11, name: "Spices", color: "#e74c3c", icon: "🌶️", biomes: [1, 2, 5], baseValue: 20, minHeight: 20, maxHeight: 40},
    wine: {id: 12, name: "Wine", color: "#8e44ad", icon: "🍇", biomes: [5, 6, 7], baseValue: 12, minHeight: 20, maxHeight: 45}
  };

  function getResourceTypes() {
    return RESOURCE_TYPES;
  }

  function generate() {
    TIME && console.time("generateResources");
    
    const {cells, burgs} = pack;
    const n = cells.i.length;
    
    cells.resource = new Uint8Array(n);
    cells.resourceAmount = new Float32Array(n);
    
    for (let i = 0; i < n; i++) {
      if (cells.h[i] < 20) continue;
      
      const biome = cells.biome[i];
      const height = cells.h[i];
      const isCoastal = cells.t[i] === 1;
      const hasRiver = cells.r[i] > 0;
      
      let bestResource = null;
      let bestScore = 0;
      
      for (const [key, resource] of Object.entries(RESOURCE_TYPES)) {
        let score = 0;
        
        if (resource.coastal && isCoastal) {
          score = 0.3 + Math.random() * 0.4;
        } else if (resource.biomes.includes(biome)) {
          if (height >= (resource.minHeight || 0) && height <= (resource.maxHeight || 100)) {
            score = 0.2 + Math.random() * 0.5;
          }
        }
        
        if (hasRiver && ["grain", "timber"].includes(key)) {
          score *= 1.3;
        }
        
        if (score > bestScore && score > 0.3) {
          bestScore = score;
          bestResource = resource;
        }
      }
      
      if (bestResource && Math.random() < 0.4) {
        cells.resource[i] = bestResource.id;
        cells.resourceAmount[i] = Math.round((0.5 + Math.random() * 1.5) * 100) / 100;
      }
    }
    
    burgs.forEach((burg, i) => {
      if (i === 0 || !burg.i) return;
      const cell = burg.cell;
      if (cells.resource[cell] === 0) {
        const localResources = cells.c[cell].filter(c => cells.resource[c] > 0);
        if (localResources.length > 0) {
          const nearbyCell = localResources[Math.floor(Math.random() * localResources.length)];
          cells.resource[cell] = cells.resource[nearbyCell];
          cells.resourceAmount[cell] = cells.resourceAmount[nearbyCell] * 0.5;
        }
      }
    });
    
    TIME && console.timeEnd("generateResources");
  }

  function getResourceById(id) {
    return Object.values(RESOURCE_TYPES).find(r => r.id === id) || null;
  }

  function getResourceByName(name) {
    return RESOURCE_TYPES[name.toLowerCase()] || null;
  }

  function getCellResources(cellId) {
    const resourceId = pack.cells.resource[cellId];
    if (!resourceId) return null;
    
    const resource = getResourceById(resourceId);
    if (!resource) return null;
    
    return {
      ...resource,
      amount: pack.cells.resourceAmount[cellId]
    };
  }

  function getStateResources(stateId) {
    const {cells} = pack;
    const resources = {};
    
    for (let i = 0; i < cells.i.length; i++) {
      if (cells.state[i] !== stateId) continue;
      
      const resourceId = cells.resource[i];
      if (!resourceId) continue;
      
      const resource = getResourceById(resourceId);
      if (!resource) continue;
      
      if (!resources[resource.name]) {
        resources[resource.name] = {
          ...resource,
          totalAmount: 0,
          cellCount: 0
        };
      }
      
      resources[resource.name].totalAmount += cells.resourceAmount[i];
      resources[resource.name].cellCount++;
    }
    
    return resources;
  }

  return {
    generate,
    getResourceTypes,
    getResourceById,
    getResourceByName,
    getCellResources,
    getStateResources,
    RESOURCE_TYPES
  };
})();
