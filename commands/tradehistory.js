const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser } = require('../utils/userManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tradehistory')
    .setDescription('View your recent trade history'),
  
  async execute(interaction) {
    const user = getUser(interaction.user.id);
    
    if (!user.tradeHistory || user.tradeHistory.length === 0) {
      return interaction.reply('📭 You have no trade history yet!');
    }
    
    const embed = new EmbedBuilder()
      .setTitle(`📜 ${interaction.user.username}'s Trade History`)
      .setColor('#4169E1')
      .setDescription(`Showing last ${Math.min(10, user.tradeHistory.length)} trades`);
    
    const recentTrades = user.tradeHistory.slice(-10).reverse();
    
    for (const trade of recentTrades) {
      const date = new Date(trade.timestamp).toLocaleDateString();
      const partner = trade.partner;
      const type = trade.type === 'sent' ? '📤 Sent' : '📥 Received';
      
      let tradeText = '';
      if (trade.items && trade.items.length > 0) {
        tradeText += `Items: ${trade.items.length}\n`;
      }
      if (trade.scrap > 0) tradeText += `🔩 ${trade.scrap} Scrap\n`;
      if (trade.coins > 0) tradeText += `🪙 ${trade.coins} Coins\n`;
      if (trade.keys > 0) tradeText += `🔑 ${trade.keys} Keys\n`;
      
      embed.addFields({
        name: `${type} - ${date}`,
        value: `Partner: <@${partner}>\n${tradeText || 'Nothing'}`,
        inline: false
      });
    }
    
    await interaction.reply({ embeds: [embed] });
  }
};