import * as CONFIG from '../../../config.json' with { type: "json" }
import * as PROFILE from '../../PROFILE.json' with { type: "json" }
import areCommandsDifferent from '../../utils/areCommandsDifferent.js'
import getApplicationCommands from '../../utils/getApplicationCommands.js'
import getLocalCommands from '../../utils/getLocalCommands.js'

let registerCommands = async (client) => {
  try {
    let localCommands = await getLocalCommands();
    let applicationCommands = await getApplicationCommands(
      client,
      PROFILE.default.profiles[PROFILE.default.profile].testServer
    );

    let updated = 0
    let ignored = 0
    console.log(`📝 Registering commands`)
    for (let localCommand of localCommands) {
      let { name, description, options } = localCommand.default;

      // console.log(typeof(localCommand),name,description,options)

      if (
        typeof(localCommand) === "object" &&
        typeof(description) === "undefined" &&
        typeof(options) === "undefined"
      ) {
        const { default: Command } = localCommand
        localCommand = new Command()
        name = localCommand.name
        description = localCommand.description
      }

      console.log(`📝 Registering command:`,`"${name}"`,description)

      let existingCommand = null
      if (applicationCommands) {
        existingCommand = await applicationCommands.cache.find(
          (cmd) => cmd.name === name
        );
      }

      if (existingCommand) {
        if (localCommand.deleted) {
          await applicationCommands.delete(existingCommand.id);
          console.log(`🗑 Deleted    command: "${name}"`);
          continue;
        }

        if (areCommandsDifferent(existingCommand, localCommand)) {
          await applicationCommands.edit(existingCommand.id, {
            description,
            options,
          });

          console.log(`🔁 Edited      command: "${name}"`);
          updated = updated + 1
        } else {
          console.log(`⏩ Skipping registering command "${name}" as it hasn't changed.`);
          ignored = ignored + 1
        }
      } else {
        if (localCommand.deleted) {
          console.log(`⏩ Skipping registering command "${name}" as it's set to delete.`);
          ignored = ignored + 1
          continue;
        }

        await applicationCommands.create({
          name,
          description,
          options,
        });
        console.log(`👍 Registered  command: "${name}"`);
        updated = updated + 1
      }
    }
    console.log("🟩 Done Registering commands")
    console.log(`Updated ${updated}/${Object.keys(localCommands).length}`)
    console.log(`Ignored  ${ignored}/${Object.keys(localCommands).length}`)
    console.log(`Total   ${updated + ignored}/${Object.keys(localCommands).length}`)
  } catch (error) {
    console.log(`There was an error: ${error.stack}`);
  }
};

export default registerCommands
