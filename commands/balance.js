const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser } = require('../utils/userManager');
const { itemsData } = require('../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('View your balance and resources'),
  
  async execute(interaction) {
    const user = getUser(interaction.user.id);
    
    const embed = new EmbedBuilder()
      .setTitle(`💰 ${interaction.user.username}'s Balance`)
      .setColor('#FFD700')
      .addFields(
        { name: '🔩 Scrap Metal', value: user.scrap.toString(), inline: true },
        { name: '🪙 Coins', value: user.coins.toString(), inline: true },
        { name: '🔑 Keys', value: user.keys.toString(), inline: true }
      );
    
    let cratesText = '';
    for (const [crateId, count] of Object.entries(user.crates)) {
      if (count > 0 && itemsData.crates[crateId]) {
        cratesText += `${itemsData.crates[crateId].emoji} ${itemsData.crates[crateId].name}: ${count}\n`;
      }
    }
    
    if (cratesText) {
      embed.addFields({ name: '📦 Crates', value: cratesText });
    }
    
    await interaction.reply({ embeds: [embed] });
  }
};
