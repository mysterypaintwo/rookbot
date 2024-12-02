const { ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');
const { ModCommand } = require('../../classes/command/modcommand.class.js')

module.exports = class MuteCommand extends ModCommand {
  constructor() {
    let comprops = {
      name: "mute",
      category: "mod",
      description: "Mutes a user in the server",
      flags: {
        bot: "optional",
        user: "invalid",
        target: "required"
      },
      options: [
        {
          name: "target-id",
          description: "The ID of the user you want to ban.",
          type: ApplicationCommandOptionType.String,
          required: true
        },
        {
          name: "member-role-id",
          description: "The ID of the Member Role you want to remove",
          type: ApplicationCommandOptionType.String
        },
        {
          name: "muted-role-id",
          description: "The ID of the Muted Role you want to add",
          type: ApplicationCommandOptionType.String
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
