const { SlashCommandBuilder } = require('discord.js');
const { getUser, saveUser } = require('../utils/userManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('convert')
    .setDescription('Convert scrap metal to coins (3 scrap = 1 coin)')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Amount of scrap to convert (must be multiple of 3)')
        .setRequired(true)
        .setMinValue(3)),
  
  async execute(interaction) {
    const user = getUser(interaction.user.id);
    const amount = interaction.options.getInteger('amount');
    
    if (amount % 3 !== 0) {
      return interaction.reply({ content: '❌ Amount must be a multiple of 3!', ephemeral: true });
    }
    
    if (user.scrap < amount) {
      return interaction.reply({ content: `❌ You don't have enough scrap! You have ${user.scrap} scrap.`, ephemeral: true });
    }
    
    const coins = amount / 3;
    user.scrap -= amount;
    user.coins += coins;
    saveUser(interaction.user.id);
    
    await interaction.reply(`✅ Converted ${amount} scrap metal into ${coins} coins!\n**New Balance:** ${user.scrap} scrap | ${user.coins} coins`);
  }
};