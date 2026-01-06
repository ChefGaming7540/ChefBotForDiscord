const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser, saveUser } = require('../utils/userManager');
const { itemsData } = require('../utils/database');
const { QUALITIES, rollQuality } = require('../utils/qualities');
const { getItemFromLootPool, rollUnusualEffect, rollWarPaint } = require('../utils/lootPool');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('open')
    .setDescription('Open a crate with a key')
    .addStringOption(option => {
      const choices = Object.keys(itemsData.crates).map(key => ({
        name: itemsData.crates[key].name,
        value: key
      }));
      return option.setName('crate')
        .setDescription('Type of crate to open')
        .setRequired(true)
        .addChoices(...choices);
    }),
  
  async execute(interaction) {
    const user = getUser(interaction.user.id);
    const crateType = interaction.options.getString('crate');
    
    if (!user.crates[crateType] || user.crates[crateType] <= 0) {
      return interaction.reply({ content: `❌ You don't have any ${itemsData.crates[crateType].name}s!`, ephemeral: true });
    }
    
    if (user.keys <= 0) {
      return interaction.reply({ content: '❌ You need a key to open this crate!', ephemeral: true });
    }
    
    user.crates[crateType]--;
    user.keys--;
    
    const openingEmbed = new EmbedBuilder()
      .setTitle(`${itemsData.crates[crateType].emoji} Opening ${itemsData.crates[crateType].name}...`)
      .setDescription('✨ *The crate is unlocking...*')
      .setColor('#FFD700');
    
    await interaction.reply({ embeds: [openingEmbed] });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const item = getItemFromLootPool(itemsData.crates[crateType].lootPool);
    
    // Check if it's a war paint
    if (item.type === 'warpaint') {
      const warPaintName = rollWarPaint();
      const quality = rollQuality(true); // War paints only get Normal or Unusual
      const qualityData = QUALITIES[quality];
      
      let unusualEffect = null;
      if (quality === 'unusual') {
        unusualEffect = rollUnusualEffect();
      }
      
      const newItem = {
        id: Date.now() + Math.random().toString(36),
        name: warPaintName,
        type: 'warpaint',
        quality: quality,
        unusualEffect: unusualEffect,
        obtainedAt: new Date().toISOString()
      };
      
      user.inventory.push(newItem);
      saveUser(interaction.user.id);
      
      const resultEmbed = new EmbedBuilder()
        .setTitle(`${itemsData.crates[crateType].emoji} Crate Opened!`)
        .setColor(qualityData.color)
        .addFields(
          { name: 'Item', value: warPaintName, inline: true },
          { name: 'Type', value: 'War Paint', inline: true },
          { name: 'Quality', value: qualityData.name, inline: true }
        );
      
      if (unusualEffect) {
        resultEmbed.addFields({ name: '✨ Unusual Effect', value: unusualEffect });
        resultEmbed.setDescription(`🎉 **UNUSUAL WAR PAINT!** This paint will apply ${unusualEffect} to any item!`);
      } else {
        resultEmbed.setDescription(`🎨 **War Paint!** Use \`/apply\` to decorate an item with this paint!`);
      }
      
      resultEmbed.setFooter({ text: `Remaining: ${user.keys} keys | ${user.crates[crateType] || 0} ${itemsData.crates[crateType].name}s` });
      
      return await interaction.editReply({ embeds: [resultEmbed] });
    }
    
    // Regular item (weapon/cosmetic)
    const quality = rollQuality(false);
    const qualityData = QUALITIES[quality];
    
    let unusualEffect = null;
    if (quality === 'unusual') {
      unusualEffect = rollUnusualEffect();
    }
    
    const newItem = {
      id: Date.now() + Math.random().toString(36),
      name: item.name,
      type: item.type,
      quality: quality,
      unusualEffect: unusualEffect,
      obtainedAt: new Date().toISOString()
    };
    
    user.inventory.push(newItem);
    saveUser(interaction.user.id);
    
    const resultEmbed = new EmbedBuilder()
      .setTitle(`${itemsData.crates[crateType].emoji} Crate Opened!`)
      .setColor(qualityData.color)
      .addFields(
        { name: 'Item', value: item.name, inline: true },
        { name: 'Type', value: item.type.charAt(0).toUpperCase() + item.type.slice(1), inline: true },
        { name: 'Quality', value: qualityData.name, inline: true }
      );
    
    if (unusualEffect) {
      resultEmbed.addFields({ name: '✨ Unusual Effect', value: unusualEffect });
      resultEmbed.setDescription(`🎉 **UNUSUAL!** You unboxed an Unusual item with ${unusualEffect}!`);
    }
    
    resultEmbed.setFooter({ text: `Remaining: ${user.keys} keys | ${user.crates[crateType] || 0} ${itemsData.crates[crateType].name}s` });
    
    await interaction.editReply({ embeds: [resultEmbed] });
  }
};