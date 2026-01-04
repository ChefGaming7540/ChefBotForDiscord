const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser, saveUser } = require('../utils/userManager');

const ROULETTE_SECTIONS = [
  { emoji: '🔩', name: 'Scrap', reward: { scrap: 20 }, weight: 30, color: '#B2B2B2' },
  { emoji: '🪙', name: 'Coins', reward: { coins: 5 }, weight: 25, color: '#FFD700' },
  { emoji: '🔩', name: 'Big Scrap', reward: { scrap: 50 }, weight: 15, color: '#8B8B8B' },
  { emoji: '🪙', name: 'Big Coins', reward: { coins: 15 }, weight: 12, color: '#FFA500' },
  { emoji: '📦', name: 'Crate', reward: { crate: 'standard' }, weight: 10, color: '#4169E1' },
  { emoji: '🔑', name: 'Key', reward: { keys: 1 }, weight: 5, color: '#9370DB' },
  { emoji: '💎', name: 'Premium Crate', reward: { crate: 'premium' }, weight: 2, color: '#FF1493' },
  { emoji: '🎁', name: 'JACKPOT', reward: { scrap: 100, coins: 30, keys: 2 }, weight: 1, color: '#FF0000' }
];

function spinRouletteWheel() {
  const totalWeight = ROULETTE_SECTIONS.reduce((sum, section) => sum + section.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const section of ROULETTE_SECTIONS) {
    random -= section.weight;
    if (random <= 0) return section;
  }
  
  return ROULETTE_SECTIONS[0];
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roulette')
    .setDescription('Spin the roulette wheel! (Costs 10 scrap)'),
  
  async execute(interaction) {
    const user = getUser(interaction.user.id);
    const cost = 10;
    
    if (user.scrap < cost) {
      return interaction.reply({ content: `❌ You need ${cost} scrap to spin the roulette wheel! You only have ${user.scrap}.`, ephemeral: true });
    }
    
    // Deduct cost
    user.scrap -= cost;
    saveUser(interaction.user.id);
    
    // Spinning animation
    const wheelDisplay = ROULETTE_SECTIONS.map(s => s.emoji).join(' ');
    const spinningEmbed = new EmbedBuilder()
      .setTitle('🎡 ROULETTE WHEEL')
      .setDescription(`${wheelDisplay}\n\n**🔄 Spinning...**`)
      .setColor('#FFD700')
      .addFields({ name: 'Cost', value: `${cost} scrap`, inline: true });
    
    await interaction.reply({ embeds: [spinningEmbed] });
    
    // Simulate spinning
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Get result
    const result = spinRouletteWheel();
    
    // Apply rewards
    let rewardText = '**You won:**\n';
    if (result.reward.scrap) {
      user.scrap += result.reward.scrap;
      rewardText += `🔩 ${result.reward.scrap} Scrap\n`;
    }
    if (result.reward.coins) {
      user.coins += result.reward.coins;
      rewardText += `🪙 ${result.reward.coins} Coins\n`;
    }
    if (result.reward.keys) {
      user.keys += result.reward.keys;
      rewardText += `🔑 ${result.reward.keys} Key(s)\n`;
    }
    if (result.reward.crate) {
      user.crates[result.reward.crate] = (user.crates[result.reward.crate] || 0) + 1;
      const { itemsData } = require('../utils/database');
      rewardText += `📦 1x ${itemsData.crates[result.reward.crate].name}\n`;
    }
    
    saveUser(interaction.user.id);
    
    // Result embed
    const resultEmbed = new EmbedBuilder()
      .setTitle('🎡 ROULETTE WHEEL')
      .setDescription(`${wheelDisplay}\n\n**${result.emoji} Landed on: ${result.name}!**\n\n${rewardText}`)
      .setColor(result.color)
      .addFields({ name: 'Balance', value: `${user.scrap} scrap | ${user.coins} coins | ${user.keys} keys`, inline: false });
    
    if (result.name === 'JACKPOT') {
      resultEmbed.setDescription(`${wheelDisplay}\n\n🎉 **JACKPOT!!!** 🎉\n\n${rewardText}`);
    }
    
    await interaction.editReply({ embeds: [resultEmbed] });
  }
};