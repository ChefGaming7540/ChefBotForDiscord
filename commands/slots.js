const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser, saveUser } = require('../utils/userManager');

const SLOT_SYMBOLS = ['🍒', '🍋', '🍊', '🔔', '💎', '7️⃣'];
const SLOT_WEIGHTS = {
  '🍒': 30,  // Common
  '🍋': 25,  // Common
  '🍊': 20,  // Uncommon
  '🔔': 15,  // Uncommon
  '💎': 8,   // Rare
  '7️⃣': 2   // Very Rare
};

const PAYOUTS = {
  '🍒🍒🍒': { scrap: 10, coins: 0, keys: 0, multiplier: 2 },
  '🍋🍋🍋': { scrap: 15, coins: 0, keys: 0, multiplier: 3 },
  '🍊🍊🍊': { scrap: 20, coins: 2, keys: 0, multiplier: 4 },
  '🔔🔔🔔': { scrap: 30, coins: 5, keys: 0, multiplier: 6 },
  '💎💎💎': { scrap: 50, coins: 10, keys: 0, multiplier: 10 },
  '7️⃣7️⃣7️⃣': { scrap: 100, coins: 20, keys: 1, multiplier: 20 } // JACKPOT!
};

function spinReel() {
  const totalWeight = Object.values(SLOT_WEIGHTS).reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  
  for (const [symbol, weight] of Object.entries(SLOT_WEIGHTS)) {
    random -= weight;
    if (random <= 0) return symbol;
  }
  
  return SLOT_SYMBOLS[0];
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slots')
    .setDescription('Spin the slot machine for rewards!')
    .addIntegerOption(option =>
      option.setName('bet')
        .setDescription('Amount of scrap to bet (default: 5)')
        .setRequired(false)
        .setMinValue(3)
        .setMaxValue(50)),
  
  async execute(interaction) {
    const user = getUser(interaction.user.id);
    const bet = interaction.options.getInteger('bet') || 5;
    
    if (user.scrap < bet) {
      return interaction.reply({ content: `❌ You don't have enough scrap! You need ${bet} but only have ${user.scrap}.`, ephemeral: true });
    }
    
    // Deduct bet
    user.scrap -= bet;
    saveUser(interaction.user.id);
    
    // Spinning animation
    const spinningEmbed = new EmbedBuilder()
      .setTitle('🎰 SLOT MACHINE')
      .setDescription('`[ 🎰 | 🎰 | 🎰 ]`\n\n*Spinning...*')
      .setColor('#FFD700')
      .addFields({ name: 'Bet', value: `${bet} scrap`, inline: true });
    
    await interaction.reply({ embeds: [spinningEmbed] });
    
    // Simulate spinning delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Spin the reels
    const reel1 = spinReel();
    const reel2 = spinReel();
    const reel3 = spinReel();
    
    const result = `${reel1}${reel2}${reel3}`;
    const payout = PAYOUTS[result];
    
    let resultText = '';
    let winnings = { scrap: 0, coins: 0, keys: 0 };
    
    if (payout) {
      // WIN!
      winnings = { ...payout };
      user.scrap += winnings.scrap;
      user.coins += winnings.coins;
      user.keys += winnings.keys;
      saveUser(interaction.user.id);
      
      if (result === '7️⃣7️⃣7️⃣') {
        resultText = '🎉 **JACKPOT!!!** 🎉\n';
      } else {
        resultText = '✨ **YOU WIN!** ✨\n';
      }
      
      resultText += `**Rewards:**\n`;
      if (winnings.scrap > 0) resultText += `🔩 ${winnings.scrap} Scrap\n`;
      if (winnings.coins > 0) resultText += `🪙 ${winnings.coins} Coins\n`;
      if (winnings.keys > 0) resultText += `🔑 ${winnings.keys} Key\n`;
    } else if (reel1 === reel2 || reel2 === reel3 || reel1 === reel3) {
      // Two matching - small consolation
      const consolation = Math.floor(bet * 0.5);
      user.scrap += consolation;
      saveUser(interaction.user.id);
      winnings.scrap = consolation;
      resultText = `Close! You got ${consolation} scrap back.`;
    } else {
      // LOSS
      resultText = `Better luck next time! You lost ${bet} scrap.`;
    }
    
    const resultEmbed = new EmbedBuilder()
      .setTitle('🎰 SLOT MACHINE')
      .setDescription(`\`[ ${reel1} | ${reel2} | ${reel3} ]\`\n\n${resultText}`)
      .setColor(payout ? '#00FF00' : '#FF0000')
      .addFields(
        { name: 'Bet', value: `${bet} scrap`, inline: true },
        { name: 'Balance', value: `${user.scrap} scrap`, inline: true }
      );
    
    if (payout) {
      resultEmbed.setFooter({ text: `Multiplier: ${payout.multiplier}x` });
    }
    
    await interaction.editReply({ embeds: [resultEmbed] });
  }
};