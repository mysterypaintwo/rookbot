const areCommandsDifferent = require('../../utils/areCommandsDifferent');
const getLocalCommands = require('../../utils/getLocalCommands');
const fs = require('fs');

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = async (client) => {
  try {
    const PROFILE = require('../../PROFILE.json');
    const guildIDs = require('../../dbs/guilds.json');
    const testGuildID = PROFILE.profiles[PROFILE.selectedprofile]?.targetserver;
    const localCommands = getLocalCommands();

    // Determine if we are in development or production mode
    let isDevelopment = process.env.NODE_ENV === 'development';
    let commandsManager = null;

    if (isDevelopment) {
      const testGuild = client.guilds.cache.get(testGuildID);
      if (!testGuild) {
        console.error(`❌ Test guild not found: ${testGuildID}`);
        return;
      }
      console.log(`🛠 Running in development mode. Using test server: ${testGuildID}`);
      commandsManager = testGuild.commands;
    } else {
      console.log('🌐 Running in production mode. Registering global commands.');
      commandsManager = client.application.commands;
    }

    const applicationCommands = await commandsManager.fetch();
    for (const localCommand of localCommands) {
      const { name, description, options = [], deleted } = localCommand;
    
      const existingCommand = applicationCommands.find(cmd => cmd.name === name);
    
      if (deleted) {
        if (existingCommand) {
          console.log(`🗑 Deleting command "${name}".`);
          try {
            await commandsManager.delete(existingCommand.id);
          } catch (error) {
            console.error(`❌ Failed to delete command "${name}":`, error.message);
          }
        } else {
          console.log(`⏩ Command "${name}" is already deleted.`);
        }
        continue;
      }
    
      if (existingCommand) {
        if (areCommandsDifferent(existingCommand, localCommand)) {
          console.log(`🔁 Updating command "${name}".`);
          try {
            await commandsManager.edit(existingCommand.id, { description, options });
          } catch (error) {
            console.error(`❌ Failed to edit command "${name}":`, error.message);
          }
        } else {
          console.log(`✅ Command "${name}" is up-to-date.`);
        }
      } else {
        console.log(`👍 Registering new command "${name}".`);
        try {
          await commandsManager.create({ name, description, options });
        } catch (error) {
          console.error(`❌ Failed to register command "${name}":`, error.message);
        }
      }
    }

    console.log('🎉 Command registration completed.');
  } catch (error) {
    console.error(`❌ An error occurred during command registration: ${error.stack}`);
  }
};
