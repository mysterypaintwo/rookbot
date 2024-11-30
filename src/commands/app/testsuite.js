const { ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');
const { BotDevCommand } = require('../../classes/command/botdevcommand.class')
const getLocalCommands = require('../../utils/getLocalCommands')

module.exports = class TestSuiteCommand extends BotDevCommand {
  constructor() {
    let comprops = {
      name: "testsuite",
      category: "botdev",
      description: "Runs a test suite for a command",
      options: [
        {
          name: "command-name",
          description: "The name of the command to test.",
          type: ApplicationCommandOptionType.String,
          required: true
        }
      ],
      // permissionsRequired: [PermissionFlagsBits.Administrator],
      // botPermissions: [PermissionFlagsBits.Administrator],
    }
    let props = {}

    super(
      {...comprops},
      {...props}
    )
  }
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  async action(client, interaction) {
    const localCommands = getLocalCommands()
    commandName = interaction.options.getString("command-name")

    try {
      const commandObject = localCommands.find(
        (cmd) => cmd.name === commandName
      )

      if (!commandObject) return;

      if (commandObject.devOnly) {
        let roleName = "botdev";
        let roleUserNames = roles[roleName];
        let roleUserIDs = [];
        for (let [userName, userID] of Object.entries(userIDs)) {
          if (roleUserNames.includes(userName)) {
            roleUserIDs.push(userID);
          }
        }
        console.log(roleName,roleUserNames,roleUserIDs);
        if (!roleUserIDs.includes(interaction.member.id)) {
          interaction.reply({
            content: 'Only developers are allowed to run this command.',
            ephemeral: true
          })
          return
        }
      }

      if (commandObject.testOnly) {
        let testGuilds = []
        for (let [guildID, guildName] of Object.entries(guildIDs)) {
          if (guildName.includes("Test")) {
            testGuilds.push(guildID)
          }
        }
        if (!(testGuilds.includes(interaction.guild.id))) {
          interaction.reply({
            content: 'This command cannot be ran here.',
            ephemeral: true
          })
          return
        }
      }

      if (commandObject.permissionsRequired?.length) {
        for (const permission of commandObject.permissionsRequired) {
          if (!interaction.member.permissions.has(permission)) {
            interaction.reply({
              content: 'Not enough permissions.',
              ephemeral: true
            })
            return
          }
        }
      }

      if (commandObject.botPermissions?.length) {
        for (const permission of commandObject.botPermissions) {
          const bot = interaction.guild.members.me

          if (!bot.permissions.has(permission)) {
            interaction.reply({
              content: "I don't have enough permissions.",
              ephemeral: true
            })
            return
          }
        }
      }

      await commandObject.test(client, interaction);
    } catch (error) {
      console.log(`There was an error running this command: ${error.stack}`);
    }
  }
}
