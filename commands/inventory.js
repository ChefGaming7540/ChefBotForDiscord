const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser } = require('../utils/userManager');
const { QUALITIES } = require('../utils/qualities');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('View your item inventory')
    .addBooleanOption(option =>
      option.setName('show_ids')
        .setDescription('Show item IDs for trading/scrapping')
        .setRequired(false)),
  
  async execute(interaction) {
    const user = getUser(interaction.user.id);
    const showIds = interaction.options.getBoolean('show_ids') || false;
    
    if (user.inventory.length === 0) {
      return interaction.reply('📭 Your inventory is empty! Open some crates to get items.');
    }
    
    const embed = new EmbedBuilder()
      .setTitle(`🎒 ${interaction.user.username}'s Inventory`)
      .setColor('#4169E1')
      .setDescription(`Total Items: ${user.inventory.length}`);
    
    const byQuality = {};
    for (const item of user.inventory) {
      if (!byQuality[item.quality]) byQuality[item.quality] = [];
      byQuality[item.quality].push(item);
    }
    
    for (const [quality, items] of Object.entries(byQuality)) {
      const qualityData = QUALITIES[quality];
      let itemList = items.slice(0, 5).map(item => {
        let line = showIds ? `\`${item.id}\` ` : '• ';
        line += item.name;
        if (item.warPaint) line += ` (${item.warPaint})`;
        if (item.unusualEffect) line += ` [${item.unusualEffect}]`;
        return line;
      }).join('\n');
      
      if (items.length > 5) itemList += `\n*...and ${items.length - 5} more*`;
      
      embed.addFields({ name: `${qualityData.name} (${items.length})`, value: itemList });
    }
    
    if (showIds) {
      embed.setFooter({ text: 'Use these IDs for /convert item-to-scrap, /apply, or /trade' });
    }
    
    await interaction.reply({ embeds: [embed] });
  }
};