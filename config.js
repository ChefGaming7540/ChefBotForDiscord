require('dotenv').config();

module.exports = {
  TOKEN: process.env.DISCORD_TOKEN,
  CLIENT_ID: process.env.CLIENT_ID,
  GUILD_ID: process.env.GUILD_ID || '', // Optional
  DATA_DIR: './data',
  DAILY_COOLDOWN: 24 * 60 * 60 * 1000,
  STARTING_RESOURCES: {
    scrap: 50,
    coins: 10,
    keys: 1,
    crates: { standard: 1 }
  }
};