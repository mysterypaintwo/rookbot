const { ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');
const { ModCommand } = require('../../classes/command/modcommand.class')

module.exports = class UnbanCommand extends ModCommand {
  constructor() {
    let comprops = {
      name: "unban",
      category: "mod",
      description: "Unbans a user from the server.",
      flags: {
        bot: "optional",
        user: "invalid",
        target: "required"
      },
      options: [
        {
          name: "target-id",
          description: "The ID of the user you want to unban.",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
        {
          name: "reason",
          description: "The reason for unbanning the user.",
          type: ApplicationCommandOptionType.String,
          required: false,
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
