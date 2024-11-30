const { ApplicationCommandOptionType } = require('discord.js');
const { ModCommand } = require('../../classes/command/modcommand.class')
const { RookEmbed } = require('../../classes/embed/rembed.class');
const colors = require('../../dbs/colors.json')

module.exports = class KickCommand extends ModCommand {
  constructor() {
    let comprops = {
      name: "kick",
      category: "mod",
      description: "Kicks a user from the server.",
      options: [
        {
          name: "user-id",
          description: "The ID of the user you want to kick.",
          type: ApplicationCommandOptionType.String,
          required: true
        },
        {
          name: "reason",
          description: "The reason for kicking the user.",
          type: ApplicationCommandOptionType.String,
          required: false
        }
      ]
    }
    let props = {}

    super(
      {...comprops},
      {...props}
    )
  }
}
