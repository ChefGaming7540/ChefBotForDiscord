const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all available commands and information'),
  
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🤖 TF2 Gacha Bot Commands')
      .setColor('#8650AC')
      .addFields(
        { name: '💰 Economy', value: '`/balance` - View your balance\n`/convert` - Convert scrap to coins (3:1)\n`/daily` - Claim daily rewards' },
        { name: '📦 Crates', value: '`/buy` - Buy crates with coins\n`/open` - Open a crate with a key' },
        { name: '🎒 Inventory', value: '`/inventory` - View your items' },
        { name: '💡 Tips', value: 'Start with 50 scrap, 10 coins, 1 crate, and 1 key!\nConversion: 3 Scrap = 1 Coin' }
      );
    
    await interaction.reply({ embeds: [embed] });
  }
};