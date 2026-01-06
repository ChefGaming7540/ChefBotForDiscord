const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config');

const commands = [];
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(config.TOKEN);

(async () => {
  try {
    console.log(`🔄 Started refreshing ${commands.length} application (/) commands.`);

    // For guild-based commands (faster, good for testing)
    if (config.GUILD_ID) {
      const data = await rest.put(
        Routes.applicationGuildCommands(config.CLIENT_ID, config.GUILD_ID),
        { body: commands },
      );
      console.log(`✅ Successfully reloaded ${data.length} guild commands.`);
    } else {
      // For global commands (takes up to 1 hour to propagate)
      const data = await rest.put(
        Routes.applicationCommands(config.CLIENT_ID),
        { body: commands },
      );
      console.log(`✅ Successfully reloaded ${data.length} global commands.`);
    }
  } catch (error) {
    console.error('❌ Error deploying commands:', error);
  }
})();