const { SlashCommandBuilder } = require('discord.js');
const { getUser, saveUser } = require('../utils/userManager');
const { SCRAP_VALUES, KEY_REWARDS } = require('../utils/qualities');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('convert')
    .setDescription('Convert scrap metal to coins or scrap items for scrap metal')
    .addSubcommand(subcommand =>
      subcommand
        .setName('scrap-to-coins')
        .setDescription('Convert scrap metal to coins (3 scrap = 1 coin)')
        .addIntegerOption(option =>
          option.setName('amount')
            .setDescription('Amount of scrap to convert (must be multiple of 3)')
            .setRequired(true)
            .setMinValue(3)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('item-to-scrap')
        .setDescription('Break down an item into scrap metal')
        .addStringOption(option =>
          option.setName('item_id')
            .setDescription('The ID of the item to scrap (use /inventory to see IDs)')
            .setRequired(true))),
  
  async execute(interaction) {
    const user = getUser(interaction.user.id);
    const subcommand = interaction.options.getSubcommand();
    
    if (subcommand === 'scrap-to-coins') {
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
    
    else if (subcommand === 'item-to-scrap') {
      const itemId = interaction.options.getString('item_id');
      const itemIndex = user.inventory.findIndex(item => item.id === itemId);
      
      if (itemIndex === -1) {
        return interaction.reply({ content: '❌ Item not found in your inventory!', ephemeral: true });
      }
      
      const item = user.inventory[itemIndex];
      const scrapValue = SCRAP_VALUES[item.quality] || 1;
      const keyReward = KEY_REWARDS[item.quality] || 0;
      
      // Remove item from inventory
      user.inventory.splice(itemIndex, 1);
      user.scrap += scrapValue;
      
      let rewardText = `♻️ Scrapped **${item.name}** (${item.quality})!\n\n**Rewards:**\n🔩 ${scrapValue} scrap metal`;
      
      if (keyReward > 0) {
        user.keys += keyReward;
        rewardText += `\n🔑 ${keyReward} key${keyReward > 1 ? 's' : ''}`;
      }
      
      saveUser(interaction.user.id);
      
      rewardText += `\n\n**New Balance:** ${user.scrap} scrap | ${user.keys} keys`;
      
      await interaction.reply(rewardText);
    }
  }
};