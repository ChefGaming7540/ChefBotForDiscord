const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser, saveUser } = require('../utils/userManager');
const { QUALITIES } = require('../utils/qualities');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('apply')
    .setDescription('Apply a war paint to an item')
    .addStringOption(option =>
      option.setName('warpaint_id')
        .setDescription('ID of the war paint to apply')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('item_id')
        .setDescription('ID of the item to apply paint to')
        .setRequired(true)),
  
  async execute(interaction) {
    const user = getUser(interaction.user.id);
    const warPaintId = interaction.options.getString('warpaint_id');
    const itemId = interaction.options.getString('item_id');
    
    // Find war paint
    const warPaintIndex = user.inventory.findIndex(item => item.id === warPaintId && item.type === 'warpaint');
    if (warPaintIndex === -1) {
      return interaction.reply({ content: '❌ War paint not found in your inventory!', ephemeral: true });
    }
    
    // Find target item
    const itemIndex = user.inventory.findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
      return interaction.reply({ content: '❌ Target item not found in your inventory!', ephemeral: true });
    }
    
    const warPaint = user.inventory[warPaintIndex];
    const targetItem = user.inventory[itemIndex];
    
    // Check if item is a weapon or cosmetic
    if (targetItem.type !== 'weapon' && targetItem.type !== 'cosmetic') {
      return interaction.reply({ content: '❌ You can only apply war paints to weapons and cosmetics!', ephemeral: true });
    }
    
    // Apply war paint logic
    let newQuality = 'decorated';
    let newUnusualEffect = targetItem.unusualEffect;
    
    // If war paint is Unusual
    if (warPaint.quality === 'unusual') {
      if (targetItem.quality === 'unusual') {
        // Unusual item + Unusual war paint = Decorated Unusual (keeps item's effect)
        newQuality = 'decorated';
        // Keep the item's original unusual effect
      } else {
        // Normal item + Unusual war paint = Unusual (gets war paint's effect)
        newQuality = 'unusual';
        newUnusualEffect = warPaint.unusualEffect;
      }
    } else {
      // Normal war paint
      if (targetItem.quality === 'unusual') {
        // Unusual item + Normal war paint = Decorated Unusual (keeps item's effect)
        newQuality = 'decorated';
      } else {
        // Normal item + Normal war paint = Decorated
        newQuality = 'decorated';
        newUnusualEffect = null;
      }
    }
    
    // Update item
    targetItem.quality = newQuality;
    targetItem.warPaint = warPaint.name;
    targetItem.unusualEffect = newUnusualEffect;
    
    // Remove war paint from inventory
    user.inventory.splice(warPaintIndex, 1);
    saveUser(interaction.user.id);
    
    // Build quality name for display
    let qualityDisplay = QUALITIES[newQuality].name;
    if (newQuality === 'decorated' && targetItem.unusualEffect) {
      qualityDisplay = `Decorated Unusual`;
    }
    
    const embed = new EmbedBuilder()
      .setTitle('🎨 War Paint Applied!')
      .setDescription(`Successfully applied **${warPaint.name}** to your **${targetItem.name}**!`)
      .setColor(QUALITIES[newQuality].color)
      .addFields(
        { name: 'Item', value: targetItem.name, inline: true },
        { name: 'War Paint', value: warPaint.name, inline: true },
        { name: 'New Quality', value: qualityDisplay, inline: true }
      );
    
    if (newUnusualEffect) {
      embed.addFields({ name: '✨ Unusual Effect', value: newUnusualEffect });
    }
    
    await interaction.reply({ embeds: [embed] });
  }
};