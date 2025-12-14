"use strict";

const EconomyConfig = {
  RESOURCE_CATEGORIES: {
    BONUS: "bonus",
    LUXURY: "luxury",
    STRATEGIC: "strategic"
  },

  BIOMES: {
    MARINE: 0,
    HOT_DESERT: 1,
    COLD_DESERT: 2,
    SAVANNA: 3,
    GRASSLAND: 4,
    TROPICAL_SEASONAL_FOREST: 5,
    TEMPERATE_DECIDUOUS_FOREST: 6,
    TROPICAL_RAINFOREST: 7,
    TEMPERATE_RAINFOREST: 8,
    TAIGA: 9,
    TUNDRA: 10,
    GLACIER: 11,
    WETLAND: 12
  },

  IMPROVEMENTS: {
    mine: {
      id: "mine",
      name: "Mine",
      buildCost: 3,
      validCategories: ["strategic", "luxury"],
      validResources: ["iron", "coal", "copper", "gold", "silver", "gems", "marble"],
      tileYieldDelta: {production: 1},
      activatesResource: true
    },
    farm: {
      id: "farm",
      name: "Farm",
      buildCost: 2,
      validCategories: ["bonus"],
      validResources: ["wheat", "rice", "cattle", "sheep", "cotton"],
      tileYieldDelta: {food: 2},
      activatesResource: true
    },
    pasture: {
      id: "pasture",
      name: "Pasture",
      buildCost: 2,
      validCategories: ["bonus", "luxury"],
      validResources: ["horses", "cattle", "sheep", "ivory"],
      tileYieldDelta: {food: 1, production: 1},
      activatesResource: true
    },
    plantation: {
      id: "plantation",
      name: "Plantation",
      buildCost: 3,
      validCategories: ["luxury"],
      validResources: ["spices", "silk", "dyes", "incense", "sugar", "wine", "tea", "coffee", "cocoa", "tobacco"],
      tileYieldDelta: {gold: 2},
      activatesResource: true
    },
    camp: {
      id: "camp",
      name: "Camp",
      buildCost: 2,
      validCategories: ["bonus", "luxury"],
      validResources: ["furs", "ivory", "deer", "truffles"],
      tileYieldDelta: {gold: 1, food: 1},
      activatesResource: true
    },
    fishery: {
      id: "fishery",
      name: "Fishery",
      buildCost: 2,
      validCategories: ["bonus"],
      validResources: ["fish", "crabs", "whales", "pearls"],
      tileYieldDelta: {food: 2},
      activatesResource: true
    },
    quarry: {
      id: "quarry",
      name: "Quarry",
      buildCost: 3,
      validCategories: ["bonus", "strategic"],
      validResources: ["stone", "marble"],
      tileYieldDelta: {production: 2},
      activatesResource: true
    },
    lumbermill: {
      id: "lumbermill",
      name: "Lumber Mill",
      buildCost: 2,
      validCategories: ["bonus"],
      validResources: ["wood"],
      tileYieldDelta: {production: 2},
      activatesResource: true
    },
    well: {
      id: "well",
      name: "Oil Well",
      buildCost: 4,
      validCategories: ["strategic"],
      validResources: ["oil"],
      tileYieldDelta: {production: 3},
      activatesResource: true
    }
  },

  RESOURCES: {
    iron: {
      id: "iron",
      name: "Iron",
      category: "strategic",
      icon: "⚒️",
      spawnRules: {
        allowedBiomes: [4, 6, 9, 10],
        minHeight: 30,
        maxHeight: 70,
        rarityWeight: 0.15,
        clustering: true
      },
      revealTech: "iron_working",
      improvementRequired: "mine",
      tileYieldDelta: {production: 1},
      perTurnIncome: 2,
      baseCap: 20
    },
    coal: {
      id: "coal",
      name: "Coal",
      category: "strategic",
      icon: "⛏️",
      spawnRules: {
        allowedBiomes: [4, 6, 9],
        minHeight: 25,
        maxHeight: 60,
        rarityWeight: 0.12,
        clustering: true
      },
      revealTech: "industrialization",
      improvementRequired: "mine",
      tileYieldDelta: {production: 2},
      perTurnIncome: 2,
      baseCap: 30
    },
    copper: {
      id: "copper",
      name: "Copper",
      category: "strategic",
      icon: "🔶",
      spawnRules: {
        allowedBiomes: [1, 3, 4, 6],
        minHeight: 25,
        maxHeight: 55,
        rarityWeight: 0.18,
        clustering: false
      },
      revealTech: null,
      improvementRequired: "mine",
      tileYieldDelta: {production: 1},
      perTurnIncome: 2,
      baseCap: 15
    },
    horses: {
      id: "horses",
      name: "Horses",
      category: "strategic",
      icon: "🐴",
      spawnRules: {
        allowedBiomes: [3, 4],
        minHeight: 20,
        maxHeight: 40,
        rarityWeight: 0.1,
        clustering: true
      },
      revealTech: "animal_husbandry",
      improvementRequired: "pasture",
      tileYieldDelta: {production: 1, food: 1},
      perTurnIncome: 1,
      baseCap: 10
    },
    oil: {
      id: "oil",
      name: "Oil",
      category: "strategic",
      icon: "🛢️",
      spawnRules: {
        allowedBiomes: [1, 2, 4, 12],
        minHeight: 20,
        maxHeight: 35,
        rarityWeight: 0.08,
        clustering: true
      },
      revealTech: "refining",
      improvementRequired: "well",
      tileYieldDelta: {production: 3},
      perTurnIncome: 3,
      baseCap: 25
    },

    wheat: {
      id: "wheat",
      name: "Wheat",
      category: "bonus",
      icon: "🌾",
      spawnRules: {
        allowedBiomes: [3, 4, 6],
        minHeight: 20,
        maxHeight: 35,
        rarityWeight: 0.25,
        clustering: true
      },
      revealTech: null,
      improvementRequired: "farm",
      tileYieldDelta: {food: 2}
    },
    rice: {
      id: "rice",
      name: "Rice",
      category: "bonus",
      icon: "🍚",
      spawnRules: {
        allowedBiomes: [5, 7, 12],
        minHeight: 20,
        maxHeight: 30,
        rarityWeight: 0.2,
        clustering: true
      },
      revealTech: null,
      improvementRequired: "farm",
      tileYieldDelta: {food: 3}
    },
    cattle: {
      id: "cattle",
      name: "Cattle",
      category: "bonus",
      icon: "🐄",
      spawnRules: {
        allowedBiomes: [3, 4, 6],
        minHeight: 20,
        maxHeight: 40,
        rarityWeight: 0.2,
        clustering: true
      },
      revealTech: null,
      improvementRequired: "pasture",
      tileYieldDelta: {food: 2, production: 1}
    },
    fish: {
      id: "fish",
      name: "Fish",
      category: "bonus",
      icon: "🐟",
      spawnRules: {
        allowedBiomes: [0],
        minHeight: 0,
        maxHeight: 19,
        rarityWeight: 0.3,
        clustering: true
      },
      revealTech: null,
      improvementRequired: "fishery",
      tileYieldDelta: {food: 3}
    },
    wood: {
      id: "wood",
      name: "Wood",
      category: "bonus",
      icon: "🪵",
      spawnRules: {
        allowedBiomes: [5, 6, 7, 8, 9],
        minHeight: 20,
        maxHeight: 50,
        rarityWeight: 0.35,
        clustering: true
      },
      revealTech: null,
      improvementRequired: "lumbermill",
      tileYieldDelta: {production: 2}
    },
    stone: {
      id: "stone",
      name: "Stone",
      category: "bonus",
      icon: "🪨",
      spawnRules: {
        allowedBiomes: [1, 2, 4, 6, 9, 10],
        minHeight: 30,
        maxHeight: 70,
        rarityWeight: 0.2,
        clustering: false
      },
      revealTech: null,
      improvementRequired: "quarry",
      tileYieldDelta: {production: 2}
    },
    sheep: {
      id: "sheep",
      name: "Sheep",
      category: "bonus",
      icon: "🐑",
      spawnRules: {
        allowedBiomes: [3, 4, 10],
        minHeight: 25,
        maxHeight: 50,
        rarityWeight: 0.18,
        clustering: true
      },
      revealTech: null,
      improvementRequired: "pasture",
      tileYieldDelta: {food: 1, gold: 1}
    },
    deer: {
      id: "deer",
      name: "Deer",
      category: "bonus",
      icon: "🦌",
      spawnRules: {
        allowedBiomes: [6, 8, 9],
        minHeight: 25,
        maxHeight: 55,
        rarityWeight: 0.15,
        clustering: false
      },
      revealTech: null,
      improvementRequired: "camp",
      tileYieldDelta: {food: 2}
    },

    gold: {
      id: "gold",
      name: "Gold",
      category: "luxury",
      icon: "🥇",
      spawnRules: {
        allowedBiomes: [1, 4, 6],
        minHeight: 35,
        maxHeight: 65,
        rarityWeight: 0.06,
        clustering: false
      },
      revealTech: null,
      improvementRequired: "mine",
      tileYieldDelta: {gold: 3},
      amenityValue: 4
    },
    silver: {
      id: "silver",
      name: "Silver",
      category: "luxury",
      icon: "🥈",
      spawnRules: {
        allowedBiomes: [2, 4, 6, 9],
        minHeight: 30,
        maxHeight: 60,
        rarityWeight: 0.08,
        clustering: false
      },
      revealTech: null,
      improvementRequired: "mine",
      tileYieldDelta: {gold: 2},
      amenityValue: 3
    },
    gems: {
      id: "gems",
      name: "Gems",
      category: "luxury",
      icon: "💎",
      spawnRules: {
        allowedBiomes: [5, 6, 7],
        minHeight: 35,
        maxHeight: 70,
        rarityWeight: 0.05,
        clustering: false
      },
      revealTech: null,
      improvementRequired: "mine",
      tileYieldDelta: {gold: 3},
      amenityValue: 4
    },
    spices: {
      id: "spices",
      name: "Spices",
      category: "luxury",
      icon: "🌶️",
      spawnRules: {
        allowedBiomes: [3, 5, 7],
        minHeight: 20,
        maxHeight: 35,
        rarityWeight: 0.1,
        clustering: true
      },
      revealTech: null,
      improvementRequired: "plantation",
      tileYieldDelta: {gold: 2},
      amenityValue: 3
    },
    silk: {
      id: "silk",
      name: "Silk",
      category: "luxury",
      icon: "🧵",
      spawnRules: {
        allowedBiomes: [5, 6, 8],
        minHeight: 20,
        maxHeight: 40,
        rarityWeight: 0.08,
        clustering: true
      },
      revealTech: null,
      improvementRequired: "plantation",
      tileYieldDelta: {gold: 3},
      amenityValue: 4
    },
    dyes: {
      id: "dyes",
      name: "Dyes",
      category: "luxury",
      icon: "🎨",
      spawnRules: {
        allowedBiomes: [5, 7, 8],
        minHeight: 20,
        maxHeight: 35,
        rarityWeight: 0.1,
        clustering: false
      },
      revealTech: null,
      improvementRequired: "plantation",
      tileYieldDelta: {gold: 2},
      amenityValue: 3
    },
    incense: {
      id: "incense",
      name: "Incense",
      category: "luxury",
      icon: "🕯️",
      spawnRules: {
        allowedBiomes: [1, 3],
        minHeight: 20,
        maxHeight: 35,
        rarityWeight: 0.08,
        clustering: false
      },
      revealTech: null,
      improvementRequired: "plantation",
      tileYieldDelta: {gold: 2},
      amenityValue: 3
    },
    furs: {
      id: "furs",
      name: "Furs",
      category: "luxury",
      icon: "🦊",
      spawnRules: {
        allowedBiomes: [8, 9, 10],
        minHeight: 20,
        maxHeight: 50,
        rarityWeight: 0.12,
        clustering: true
      },
      revealTech: null,
      improvementRequired: "camp",
      tileYieldDelta: {gold: 2},
      amenityValue: 3
    },
    ivory: {
      id: "ivory",
      name: "Ivory",
      category: "luxury",
      icon: "🐘",
      spawnRules: {
        allowedBiomes: [3, 5, 7],
        minHeight: 20,
        maxHeight: 35,
        rarityWeight: 0.06,
        clustering: false
      },
      revealTech: null,
      improvementRequired: "camp",
      tileYieldDelta: {gold: 3},
      amenityValue: 4
    },
    wine: {
      id: "wine",
      name: "Wine",
      category: "luxury",
      icon: "🍷",
      spawnRules: {
        allowedBiomes: [4, 6],
        minHeight: 22,
        maxHeight: 40,
        rarityWeight: 0.1,
        clustering: true
      },
      revealTech: null,
      improvementRequired: "plantation",
      tileYieldDelta: {gold: 2, food: 1},
      amenityValue: 3
    },
    marble: {
      id: "marble",
      name: "Marble",
      category: "luxury",
      icon: "🏛️",
      spawnRules: {
        allowedBiomes: [4, 6],
        minHeight: 30,
        maxHeight: 55,
        rarityWeight: 0.08,
        clustering: false
      },
      revealTech: null,
      improvementRequired: "quarry",
      tileYieldDelta: {production: 1, gold: 2},
      amenityValue: 2
    },
    pearls: {
      id: "pearls",
      name: "Pearls",
      category: "luxury",
      icon: "🦪",
      spawnRules: {
        allowedBiomes: [0],
        minHeight: 0,
        maxHeight: 19,
        rarityWeight: 0.05,
        clustering: false
      },
      revealTech: null,
      improvementRequired: "fishery",
      tileYieldDelta: {gold: 3},
      amenityValue: 4
    },
    salt: {
      id: "salt",
      name: "Salt",
      category: "luxury",
      icon: "🧂",
      spawnRules: {
        allowedBiomes: [1, 2, 4],
        minHeight: 20,
        maxHeight: 35,
        rarityWeight: 0.12,
        clustering: true
      },
      revealTech: null,
      improvementRequired: "mine",
      tileYieldDelta: {gold: 1, food: 1},
      amenityValue: 2
    },
    truffles: {
      id: "truffles",
      name: "Truffles",
      category: "luxury",
      icon: "🍄",
      spawnRules: {
        allowedBiomes: [6, 8],
        minHeight: 25,
        maxHeight: 45,
        rarityWeight: 0.04,
        clustering: false
      },
      revealTech: null,
      improvementRequired: "camp",
      tileYieldDelta: {gold: 4},
      amenityValue: 5
    },
    cotton: {
      id: "cotton",
      name: "Cotton",
      category: "bonus",
      icon: "☁️",
      spawnRules: {
        allowedBiomes: [3, 4, 5],
        minHeight: 20,
        maxHeight: 30,
        rarityWeight: 0.15,
        clustering: true
      },
      revealTech: null,
      improvementRequired: "farm",
      tileYieldDelta: {gold: 1, production: 1}
    }
  },

  TECHS: {
    bronze_working: {
      id: "bronze_working",
      name: "Bronze Working",
      revealsResources: ["copper"],
      cost: 50
    },
    animal_husbandry: {
      id: "animal_husbandry",
      name: "Animal Husbandry",
      revealsResources: ["horses"],
      cost: 40
    },
    iron_working: {
      id: "iron_working",
      name: "Iron Working",
      revealsResources: ["iron"],
      cost: 80
    },
    industrialization: {
      id: "industrialization",
      name: "Industrialization",
      revealsResources: ["coal"],
      cost: 200
    },
    refining: {
      id: "refining",
      name: "Refining",
      revealsResources: ["oil"],
      cost: 300
    }
  },

  UNIT_COSTS: {
    warrior: {strategic: {}},
    spearman: {strategic: {copper: 1}},
    swordsman: {strategic: {iron: 1}},
    horseman: {strategic: {horses: 1}},
    knight: {strategic: {iron: 1, horses: 1}},
    tank: {strategic: {oil: 2, iron: 2}},
    artillery: {strategic: {coal: 1, iron: 1}}
  },

  BASE_YIELDS: {
    food: 0,
    production: 0,
    gold: 0,
    science: 0
  },

  RESOURCE_SPAWN_DENSITY: 0.08,
  STRATEGIC_CAP_MODIFIER: 1.0,
  LUXURY_BASE_AMENITY: 2
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = EconomyConfig;
}
