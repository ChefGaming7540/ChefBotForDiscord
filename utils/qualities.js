const QUALITIES = {
  normal: { name: "Normal", color: "#B2B2B2", chance: 40, canBeUnusual: false },
  unique: { name: "Unique", color: "#FFD700", chance: 35, canBeUnusual: false },
  vintage: { name: "Vintage", color: "#476291", chance: 12, canBeUnusual: false },
  genuine: { name: "Genuine", color: "#4D7455", chance: 8, canBeUnusual: false },
  strange: { name: "Strange", color: "#CF6A32", chance: 4, canBeUnusual: false },
  unusual: { name: "Unusual", color: "#8650AC", chance: 0.5, canBeUnusual: true },
  haunted: { name: "Haunted", color: "#38F3AB", chance: 0.3, canBeUnusual: false, seasonal: "october" },
  festivized: { name: "Festivized", color: "#E6E6E6", chance: 0.2, canBeUnusual: false, seasonal: "december" }
};

function rollQuality() {
  const month = new Date().getMonth() + 1; // 1-12
  let availableQualities = [];
  
  for (const [key, quality] of Object.entries(QUALITIES)) {
    if (quality.seasonal === "october" && month !== 10) continue;
    if (quality.seasonal === "december" && month !== 12) continue;
    availableQualities.push({ key, ...quality });
  }
  
  const totalChance = availableQualities.reduce((sum, q) => sum + q.chance, 0);
  let roll = Math.random() * totalChance;
  
  for (const quality of availableQualities) {
    roll -= quality.chance;
    if (roll <= 0) return quality.key;
  }
  
  return 'unique';
}

module.exports = {
  QUALITIES,
  rollQuality
};