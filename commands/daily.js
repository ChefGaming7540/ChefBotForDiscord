const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser, saveUser } = require('../utils/userManager');
const config = require('../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Claim your daily rewards'),
  
  async execute(interaction) {
    const user = getUser(interaction.user.id);
    const now = Date.now();
    const lastDaily = user.lastDaily || 0;
    
    if (now - lastDaily < config.DAILY_COOLDOWN) {
      const remaining = config.DAILY_COOLDOWN - (now - lastDaily);
      const hours = Math.floor(remaining / (60 * 60 * 1000));
      const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
      return interaction.reply({ content: `⏰ Daily reward already claimed! Come back in ${hours}h ${minutes}m.`, ephemeral: true });
    }
    
    const reward = {
      scrap: 15,
      coins: 3,
      keys: 1
    };
    
    user.scrap += reward.scrap;
    user.coins += reward.coins;
    user.keys += reward.keys;
    user.lastDaily = now;
    saveUser(interaction.user.id);
    
    const embed = new EmbedBuilder()
      .setTitle('🎁 Daily Reward Claimed!')
      .setColor('#00FF00')
      .setDescription(`You received:\n🔩 ${reward.scrap} Scrap Metal\n🪙 ${reward.coins} Coins\n🔑 ${reward.keys} Key`)
      .setFooter({ text: 'Come back tomorrow for more rewards!' });
    
    await interaction.reply({ embeds: [embed] });
  }
};