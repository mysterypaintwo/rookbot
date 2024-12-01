const { ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');
const { ModCommand } = require('../../classes/command/modcommand.class.js')

module.exports = class BanCommand extends ModCommand {
  constructor() {
    let comprops = {
      name: "ban",
      category: "mod",
      description: "Bans a user from the server",
      flags: { target: "required" },
      options: [
        {
          name: "user-id",
          description: "The ID of the user you want to ban.",
          type: ApplicationCommandOptionType.String,
          required: true
        },
        {
          name: "reason",
          description: "The reason for banning the user.",
          type: ApplicationCommandOptionType.String,
          required: false
        }
      ],
      // permissionsRequired: [PermissionFlagsBits.BanMembers],
      // botPermissions: [PermissionFlagsBits.BanMembers],
    }
    let props = {}

    super(
      {...comprops},
      {...props}
    )
  }
}
