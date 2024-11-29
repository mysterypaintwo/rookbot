const areCommandsDifferent = require('../../utils/areCommandsDifferent');
const getLocalCommands = require('../../utils/getLocalCommands');

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = async (client) => {
  try {
    const PROFILE = require('../../PROFILE.json');
    const testGuildID = PROFILE.profiles[PROFILE.selectedprofile]?.targetserver;
    const localCommands = getLocalCommands();

    // Determine if we are in development or production mode
    let isDevelopment = process.env.NODE_ENV === 'development';
    if (!isDevelopment) {
      isDevelopment = PROFILE.profiles[PROFILE.selectedprofile]?.DEV;
    }
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
      let { name, description, options = [], autocomplete = null, deleted } = localCommand;

      const existingCommand = applicationCommands.find(cmd => cmd.name === name);

      if (existingCommand) {
        if (deleted) {
          console.log(`🗑 Deleting: "${name}"`);
          try {
            await commandsManager.delete(existingCommand.id);
          } catch (error) {
            console.error(`❌ Failed to delete: "${name}":`, error.message);
          }
          continue;
        }

        if (areCommandsDifferent(existingCommand, localCommand)) {
          console.log(`🔁 Updating: "${name}"`);
          try {
            await commandsManager.edit(existingCommand.id, { description, options, autocomplete });
          } catch (error) {
            if (error.code === 429) {
              console.warn(`⏳ Rate limit hit. Retrying for "${name}" after ${error.retry_after || 1000}ms.`);
              await wait(error.retry_after || 1000);
              await commandsManager.edit(existingCommand.id, { description, options, autocomplete });
            } else {
              console.error(`❌ Failed to edit: "${name}":`, error.message);
            }
          }
        } else {
          console.log(`✅ Current: "${name}"`);
        }
      } else {
        if (deleted) {
          console.log(`⏩ Skipping deleted: "${name}"`);
          continue;
        }

        if (name.indexOf("Command") > -1) {
          let cmd = new localCommand()
          name = cmd.name
          description = cmd.description
          options = cmd.options,
          autocomplete = cmd?.autocomplete ? cmd.autocomplete : null
        }

        console.log(`👍 Registering new: "${name}"`);
        try {
          await commandsManager.create({ name, description, options, autocomplete });
        } catch (error) {
          if (error.code === 429) {
            console.warn(`⏳ Rate limit hit. Retrying for "${name}" after ${error.retry_after || 1000}ms.`);
            await wait(error.retry_after || 1000);
            await commandsManager.create({ name, description, options, autocomplete });
          } else {
            console.error(`❌ Failed to register: "${name}":`, error.message);
          }
        }
      }
    }

    console.log('🎉 Registration completed');
  } catch (error) {
    console.error(`❌ Registration error: ${error.stack}`);
  }
};
