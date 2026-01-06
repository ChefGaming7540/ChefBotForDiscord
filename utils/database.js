const fs = require('fs');
const path = require('path');
const config = require('../config');

const USERS_FILE = path.join(config.DATA_DIR, 'users.json');
const ITEMS_FILE = path.join(config.DATA_DIR, 'items.json');

// Initialize data directory
if (!fs.existsSync(config.DATA_DIR)) {
  fs.mkdirSync(config.DATA_DIR);
}

function loadData(file, defaultData = {}) {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function saveData(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

const users = loadData(USERS_FILE, {});
const itemsData = loadData(ITEMS_FILE, {
  crates: {
    "standard": {
      name: "Standard Crate",
      price: 5,
      emoji: "📦",
      seasonal: false,
      lootPool: "standard"
    },
    "premium": {
      name: "Premium Crate",
      price: 15,
      emoji: "🎁",
      seasonal: false,
      lootPool: "premium"
    },
    "halloween": {
      name: "Spooky Crate",
      price: 10,
      offSeasonPrice: 25,
      emoji: "🎃",
      seasonal: true,
      season: "october",
      lootPool: "halloween"
    },
    "winter": {
      name: "Festive Crate",
      price: 10,
      offSeasonPrice: 25,
      emoji: "🎄",
      seasonal: true,
      season: "december",
      lootPool: "winter"
    }
  },
  lootPools: {
    "standard": [
      { name: "Scattergun", type: "weapon", weight: 30 },
      { name: "Rocket Launcher", type: "weapon", weight: 30 },
      { name: "Flame Thrower", type: "weapon", weight: 30 },
      { name: "Grenade Launcher", type: "weapon", weight: 25 },
      { name: "Minigun", type: "weapon", weight: 25 },
      { name: "Top Hat", type: "cosmetic", weight: 15 },
      { name: "Fancy Fedora", type: "cosmetic", weight: 15 },
      { name: "Mann Co. Cap", type: "cosmetic", weight: 15 }
    ],
    "premium": [
      { name: "Australium Rocket Launcher", type: "weapon", weight: 20 },
      { name: "Golden Frying Pan", type: "weapon", weight: 5 },
      { name: "Unusual Top Hat", type: "cosmetic", weight: 10 },
      { name: "Team Captain", type: "cosmetic", weight: 15 },
      { name: "Bills Hat", type: "cosmetic", weight: 20 }
    ],
    "halloween": [
      { name: "Haunted Hat", type: "cosmetic", weight: 25 },
      { name: "Spine-Chilling Skull", type: "cosmetic", weight: 25 },
      { name: "Voodoo Juju", type: "cosmetic", weight: 20 },
      { name: "Ghostly Gibus", type: "cosmetic", weight: 30 }
    ],
    "winter": [
      { name: "Santa Hat", type: "cosmetic", weight: 30 },
      { name: "Festive Rocket Launcher", type: "weapon", weight: 25 },
      { name: "Holiday Punch", type: "weapon", weight: 25 },
      { name: "Winter Wonderland Wrap", type: "cosmetic", weight: 20 }
    ]
  },
  unusualEffects: [
    "Burning Flames", "Scorching Flames", "Searing Plasma", "Vivid Plasma",
    "Sunbeams", "Cloudy Moon", "Stormy Storm", "Blizzardy Storm",
    "Nuts n' Bolts", "Orbiting Fire", "Bubbling", "Smoking",
    "Steaming", "Flaming Lantern", "Cloudy Moon", "Ethereal Flame",
    "Green Confetti", "Purple Confetti", "Haunted Ghosts", "Green Energy",
    "Purple Energy", "Terrorwatt", "Phosphorous", "Sulphurous"
  ],
  warPaints: [
    { name: "Plaid Potshotter Mk. II", weight: 10 },
    { name: "Tiger Buffed", weight: 12 },
    { name: "Hot Rod", weight: 12 },
    { name: "Bamboo Brushed", weight: 15 },
    { name: "Sudden Flurry", weight: 15 },
    { name: "Night Owl", weight: 13 },
    { name: "Macabre Web", weight: 10 },
    { name: "Fire Glazed", weight: 8 },
    { name: "Miami Element", weight: 8 },
    { name: "Dragon Slayer", weight: 7 }
  ]
});

module.exports = {
  users,
  itemsData,
  saveUsers: () => saveData(USERS_FILE, users),
  saveItems: () => saveData(ITEMS_FILE, itemsData)
};