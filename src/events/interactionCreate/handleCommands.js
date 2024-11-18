import * as CONFIG from '../../../config.json' with { type: "json" }
import getLocalCommands from '../../utils/getLocalCommands.js'

let handleCommands = async (client, interaction) => {
  console.log("Executing a command")
  if (!interaction.isChatInputCommand()) {
    console.log("Interaction is not a Chat Input Command")
    return
  }

  const localCommands = await getLocalCommands();

  try {
    console.log(`Running: ${interaction.commandName}`)
    const commandObject = localCommands[interaction.commandName]

    if (!commandObject) {
      console.log("Interaction referenced a non-Command Object")
      return
    }

    if (commandObject.devOnly) {
      console.log("Dev-Only")
      if (!CONFIG.default.devs.includes(interaction.member.id)) {
        interaction.reply({
          content: 'Only developers are allowed to run this command.',
          ephemeral: true,
        })
        return
      }
    }

    if (commandObject.testOnly) {
      console.log("Test-Only")
      if (!(interaction.guild.id === CONFIG.default.testServer)) {
        interaction.reply({
          content: 'This command cannot be ran here.',
          ephemeral: true,
        })
        return
      }
    }

    if (commandObject.permissionsRequired?.length) {
      for (const permission of commandObject.permissionsRequired) {
        if (!interaction.member.permissions.has(permission)) {
          interaction.reply({
            content: 'Not enough permissions.',
            ephemeral: true,
          })
          return
        }
      }
    }

    if (commandObject.botPermissions?.length) {
      for (const permission of commandObject.botPermissions) {
        const bot = interaction.guild.members.me;

        if (!bot.permissions.has(permission)) {
          interaction.reply({
            content: "I don't have enough permissions.",
            ephemeral: true,
          })
          return
        }
      }
    }

    await commandObject.execute(client, interaction);
  } catch (error) {
    console.log(`There was an error running this command: ${error.stack}`)
  }
};

export default handleCommands
