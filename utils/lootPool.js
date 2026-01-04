const { itemsData } = require('./database');

function getItemFromLootPool(poolName) {
  const pool = itemsData.lootPools[poolName];
  if (!pool) return null;
  
  const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * totalWeight;
  
  for (const item of pool) {
    roll -= item.weight;
    if (roll <= 0) return { ...item };
  }
  
  return pool[0];
}

function rollUnusualEffect() {
  return itemsData.unusualEffects[Math.floor(Math.random() * itemsData.unusualEffects.length)];
}

module.exports = {
  getItemFromLootPool,
  rollUnusualEffect
};