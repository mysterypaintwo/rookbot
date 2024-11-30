const { ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');
const { ModCommand } = require('../../classes/command/modcommand.class')
const { RookEmbed } = require('../../classes/embed/rembed.class');
const colors = require('../../dbs/colors.json')

module.exports = class WarnCommand extends ModCommand {
  constructor() {
    let comprops = {
      name: "warn",
      category: "mod",
      description: "Warns a user in the server.",
      options: [
        {
          name: "user-id",
          description: "The ID of the user you want to warn.",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
        {
          name: "reason",
          description: "The reason for warning the user.",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
      ],
      // permissionsRequired: [PermissionFlagsBits.ManageMessages],
      // botPermissions: [PermissionFlagsBits.ManageMessages],
    }
    let props = {}

    super(
      {...comprops},
      {...props}
    )
  }
}
