const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// Load commands
client.commands = new Collection();
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

// Handle slash command interactions
client.on('interactionCreate', async interaction => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`Error executing command ${interaction.commandName}:`, error);
      const errorMessage = { content: '❌ There was an error executing that command!', ephemeral: true };
      
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorMessage);
      } else {
        await interaction.reply(errorMessage);
      }
    }
  }
  
  // Handle button interactions for trading
  else if (interaction.isButton()) {
    const { getUser, saveUser } = require('./utils/userManager');
    
    if (interaction.customId.startsWith('trade_accept_')) {
      const tradeId = interaction.customId.replace('trade_accept_', '');
      const tradeCommand = require('./commands/trade');
      const activeTrades = tradeCommand.activeTrades || new Map();
      
      const trade = activeTrades.get(tradeId);
      if (!trade) {
        return interaction.reply({ content: '❌ This trade has expired!', ephemeral: true });
      }
      
      if (interaction.user.id !== trade.recipient) {
        return interaction.reply({ content: '❌ This trade is not for you!', ephemeral: true });
      }
      
      const initiatorUser = getUser(trade.initiator);
      const recipientUser = getUser(trade.recipient);
      
      // Verify initiator still has resources
      const initiatorItems = trade.items.filter(item => 
        initiatorUser.inventory.some(i => i.id === item.id)
      );
      
      if (initiatorItems.length !== trade.items.length) {
        activeTrades.delete(tradeId);
        return interaction.reply({ content: '❌ Trade failed: Initiator no longer has all items!', ephemeral: true });
      }
      
      if (initiatorUser.scrap < trade.scrap || initiatorUser.coins < trade.coins || initiatorUser.keys < trade.keys) {
        activeTrades.delete(tradeId);
        return interaction.reply({ content: '❌ Trade failed: Initiator no longer has enough resources!', ephemeral: true });
      }
      
      // Execute trade
      // Remove from initiator
      for (const item of trade.items) {
        const index = initiatorUser.inventory.findIndex(i => i.id === item.id);
        if (index !== -1) {
          const removedItem = initiatorUser.inventory.splice(index, 1)[0];
          recipientUser.inventory.push(removedItem);
        }
      }
      
      initiatorUser.scrap -= trade.scrap;
      initiatorUser.coins -= trade.coins;
      initiatorUser.keys -= trade.keys;
      
      recipientUser.scrap += trade.scrap;
      recipientUser.coins += trade.coins;
      recipientUser.keys += trade.keys;
      
      // Update trade cooldown and history
      initiatorUser.lastTrade = Date.now();
      recipientUser.lastTrade = Date.now();
      
      const tradeRecord = {
        partner: trade.recipient,
        timestamp: Date.now(),
        items: trade.items.map(i => i.name),
        scrap: trade.scrap,
        coins: trade.coins,
        keys: trade.keys,
        type: 'sent'
      };
      
      const recipientRecord = {
        ...tradeRecord,
        partner: trade.initiator,
        type: 'received'
      };
      
      if (!initiatorUser.tradeHistory) initiatorUser.tradeHistory = [];
      if (!recipientUser.tradeHistory) recipientUser.tradeHistory = [];
      
      initiatorUser.tradeHistory.push(tradeRecord);
      recipientUser.tradeHistory.push(recipientRecord);
      
      saveUser(trade.initiator);
      saveUser(trade.recipient);
      
      activeTrades.delete(tradeId);
      
      const { EmbedBuilder } = require('discord.js');
      const successEmbed = new EmbedBuilder()
        .setTitle('✅ Trade Completed!')
        .setDescription(`<@${trade.initiator}> and <@${trade.recipient}> have successfully traded!`)
        .setColor('#00FF00');
      
      await interaction.update({ embeds: [successEmbed], components: [] });
    }
    
    else if (interaction.customId.startsWith('trade_decline_')) {
      const tradeId = interaction.customId.replace('trade_decline_', '');
      const tradeCommand = require('./commands/trade');
      const activeTrades = tradeCommand.activeTrades || new Map();
      
      const trade = activeTrades.get(tradeId);
      if (!trade) {
        return interaction.reply({ content: '❌ This trade has expired!', ephemeral: true });
      }
      
      if (interaction.user.id !== trade.recipient) {
        return interaction.reply({ content: '❌ This trade is not for you!', ephemeral: true });
      }
      
      activeTrades.delete(tradeId);
      
      const { EmbedBuilder } = require('discord.js');
      const declineEmbed = new EmbedBuilder()
        .setTitle('❌ Trade Declined')
        .setDescription(`<@${trade.recipient}> declined the trade offer.`)
        .setColor('#FF0000');
      
      await interaction.update({ embeds: [declineEmbed], components: [] });
    }
  }
});

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  console.log(`📊 Loaded ${client.commands.size} slash commands`);
  
  const { users, itemsData } = require('./utils/database');
  console.log(`👥 Loaded ${Object.keys(users).length} users`);
  console.log(`📦 Loaded ${Object.keys(itemsData.crates).length} crate types`);
});

client.login(config.TOKEN);
