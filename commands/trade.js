const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getUser, saveUser } = require('../utils/userManager');
const config = require('../config');

// Store active trades
const activeTrades = new Map();

const TRADE_LIMITS = {
  scrap: 50,
  coins: 75,
  keys: 80,
  crates: 100
};

module.exports = {
  activeTrades, // Export for button handler
  data: new SlashCommandBuilder()
    .setName('trade')
    .setDescription('Trade items with another user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to trade with')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('your_items')
        .setDescription('Your item IDs, comma-separated (e.g., abc123,def456)')
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName('your_scrap')
        .setDescription('Amount of scrap to trade')
        .setRequired(false)
        .setMinValue(0)
        .setMaxValue(TRADE_LIMITS.scrap))
    .addIntegerOption(option =>
      option.setName('your_coins')
        .setDescription('Amount of coins to trade')
        .setRequired(false)
        .setMinValue(0)
        .setMaxValue(TRADE_LIMITS.coins))
    .addIntegerOption(option =>
      option.setName('your_keys')
        .setDescription('Amount of keys to trade')
        .setRequired(false)
        .setMinValue(0)
        .setMaxValue(TRADE_LIMITS.keys)),
  
  async execute(interaction) {
    const initiator = interaction.user;
    const recipient = interaction.options.getUser('user');
    
    if (recipient.bot) {
      return interaction.reply({ content: '❌ You cannot trade with bots!', ephemeral: true });
    }
    
    if (recipient.id === initiator.id) {
      return interaction.reply({ content: '❌ You cannot trade with yourself!', ephemeral: true });
    }
    
    const initiatorUser = getUser(initiator.id);
    const recipientUser = getUser(recipient.id);
    
    // Check trade cooldown
    const now = Date.now();
    const tradeCooldown = 5 * 60 * 1000; // 5 minutes
    
    if (initiatorUser.lastTrade && now - initiatorUser.lastTrade < tradeCooldown) {
      const remaining = tradeCooldown - (now - initiatorUser.lastTrade);
      const minutes = Math.ceil(remaining / 60000);
      return interaction.reply({ content: `⏰ You must wait ${minutes} more minute(s) before trading again!`, ephemeral: true });
    }
    
    // Parse trade offer
    const itemIds = interaction.options.getString('your_items')?.split(',').map(id => id.trim()) || [];
    const scrap = interaction.options.getInteger('your_scrap') || 0;
    const coins = interaction.options.getInteger('your_coins') || 0;
    const keys = interaction.options.getInteger('your_keys') || 0;
    
    // Validate items
    const items = [];
    for (const itemId of itemIds) {
      const item = initiatorUser.inventory.find(i => i.id === itemId);
      if (!item) {
        return interaction.reply({ content: `❌ Item with ID \`${itemId}\` not found in your inventory!`, ephemeral: true });
      }
      items.push(item);
    }
    
    // Validate resources
    if (initiatorUser.scrap < scrap) {
      return interaction.reply({ content: `❌ You don't have ${scrap} scrap! You have ${initiatorUser.scrap}.`, ephemeral: true });
    }
    if (initiatorUser.coins < coins) {
      return interaction.reply({ content: `❌ You don't have ${coins} coins! You have ${initiatorUser.coins}.`, ephemeral: true });
    }
    if (initiatorUser.keys < keys) {
      return interaction.reply({ content: `❌ You don't have ${keys} keys! You have ${initiatorUser.keys}.`, ephemeral: true });
    }
    
    // Create trade offer
    const tradeId = `${initiator.id}-${recipient.id}-${Date.now()}`;
    
    let offerText = '**Your Offer:**\n';
    if (items.length > 0) {
      offerText += `📦 Items: ${items.map(i => `${i.name} (${i.quality})`).join(', ')}\n`;
    }
    if (scrap > 0) offerText += `🔩 ${scrap} Scrap\n`;
    if (coins > 0) offerText += `🪙 ${coins} Coins\n`;
    if (keys > 0) offerText += `🔑 ${keys} Keys\n`;
    
    if (items.length === 0 && scrap === 0 && coins === 0 && keys === 0) {
      return interaction.reply({ content: '❌ You must offer something to trade!', ephemeral: true });
    }
    
    const embed = new EmbedBuilder()
      .setTitle('🤝 Trade Request')
      .setDescription(`${initiator} wants to trade with ${recipient}!\n\n${offerText}\n**Waiting for ${recipient} to respond...**`)
      .setColor('#FFD700')
      .setFooter({ text: 'Trade expires in 2 minutes' });
    
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`trade_accept_${tradeId}`)
          .setLabel('Accept Trade')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`trade_decline_${tradeId}`)
          .setLabel('Decline Trade')
          .setStyle(ButtonStyle.Danger)
      );
    
    activeTrades.set(tradeId, {
      initiator: initiator.id,
      recipient: recipient.id,
      items,
      scrap,
      coins,
      keys,
      timestamp: now
    });
    
    // Auto-expire after 2 minutes
    setTimeout(() => {
      if (activeTrades.has(tradeId)) {
        activeTrades.delete(tradeId);
      }
    }, 120000);
    
    await interaction.reply({ content: `${recipient}`, embeds: [embed], components: [row] });
  }
};