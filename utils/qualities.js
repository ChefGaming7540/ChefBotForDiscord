const QUALITIES = {
  normal: { name: "Normal", color: "#B2B2B2", chance: 40, canBeUnusual: false },
  unique: { name: "Unique", color: "#FFD700", chance: 35, canBeUnusual: false },
  vintage: { name: "Vintage", color: "#476291", chance: 12, canBeUnusual: false },
  genuine: { name: "Genuine", color: "#4D7455", chance: 8, canBeUnusual: false },
  strange: { name: "Strange", color: "#CF6A32", chance: 4, canBeUnusual: false },
  unusual: { name: "Unusual", color: "#8650AC", chance: 0.5, canBeUnusual: true },
  haunted: { name: "Haunted", color: "#38F3AB", chance: 0.3, canBeUnusual: false, seasonal: "october" },
  festivized: { name: "Festivized", color: "#E6E6E6", chance: 0.2, canBeUnusual: false, seasonal: "december" },
  decorated: { name: "Decorated", color: "#FAFAFA", chance: 0, canBeUnusual: false }
};

const SCRAP_VALUES = {
  normal: 1,
  unique: 2,
  vintage: 5,
  genuine: 8,
  strange: 12,
  unusual: 50,
  haunted: 15,
  festivized: 15,
  decorated: 10
};

function rollQuality(isWarPaint = false) {
  if (isWarPaint) {
    // War paints can only be Normal or Unusual
    const roll = Math.random() * 100;
    return roll < 5 ? 'unusual' : 'normal'; // 5% chance for unusual war paint
  }
  
  const month = new Date().getMonth() + 1; // 1-12
  let availableQualities = [];
  
  for (const [key, quality] of Object.entries(QUALITIES)) {
    if (key === 'decorated') continue; // Decorated is only from war paints
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
  SCRAP_VALUES,
  rollQuality
};