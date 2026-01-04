const { SlashCommandBuilder } = require('discord.js');
const { getUser, saveUser } = require('../utils/userManager');
const { itemsData } = require('../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('buy')
    .setDescription('Buy crates with coins')
    .addStringOption(option => {
      const choices = Object.keys(itemsData.crates).map(key => ({
        name: itemsData.crates[key].name,
        value: key
      }));
      return option.setName('crate')
        .setDescription('Type of crate to buy')
        .setRequired(true)
        .addChoices(...choices);
    })
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Number of crates to buy')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(100)),
  
  async execute(interaction) {
    const user = getUser(interaction.user.id);
    const crateType = interaction.options.getString('crate');
    const amount = interaction.options.getInteger('amount') || 1;
    
    const crate = itemsData.crates[crateType];
    const month = new Date().getMonth() + 1;
    
    let price = crate.price;
    if (crate.seasonal) {
      const isInSeason = (crate.season === 'october' && month === 10) || 
                        (crate.season === 'december' && month === 12);
      if (!isInSeason && crate.offSeasonPrice) {
        price = crate.offSeasonPrice;
      }
    }
    
    const totalCost = price * amount;
    
    if (user.coins < totalCost) {
      return interaction.reply({ content: `❌ Not enough coins! You need ${totalCost} coins but only have ${user.coins}.`, ephemeral: true });
    }
    
    user.coins -= totalCost;
    user.crates[crateType] = (user.crates[crateType] || 0) + amount;
    saveUser(interaction.user.id);
    
    await interaction.reply(`✅ Purchased ${amount}x ${crate.emoji} ${crate.name} for ${totalCost} coins!`);
  }
};