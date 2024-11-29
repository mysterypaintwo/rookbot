const { PermissionFlagsBits } = require('discord.js');
const { RookCommand } = require('../../classes/command/rcommand.class')
const fs = require('fs');

module.exports = class ClearCommand extends RookCommand {
  constructor() {
    let comprops = {
      name: "clear",
      category: "mod",
      description: "Clear Messages",
      permissionsRequired: [PermissionFlagsBits.ManageMessages],
      botPermissions: [PermissionFlagsBits.ManageMessages],
    }
    let props = {}

    super(
      {...comprops},
      {...props}
    )
  }

  async action(client, interaction) {
    this.props.title = {
      text: "Clearing messages..."
    }
    this.props.description = ""

    let ROLES = JSON.parse(fs.readFileSync(`./src/dbs/${interaction.guild.id}/roles.json`, "utf8"))
    let APPROVED_ROLES = ROLES["admin"].concat(ROLES["mod"])
    let duration = ""

    if(!(await interaction.member.roles.cache.some(r=>APPROVED_ROLES.includes(r.name))) ) {
      this.error = true
      this.props.description = "Sorry, only admins can run this command. 😔"
    } else {
      limit = 100

      duration = "5s"
      if(!this.DEV) {
        await interaction.channel.messages.fetch( {
          limit: limit
        })
        .then(messages => {
          interaction.channel.bulkDelete(messages)
        })
        this.props.description = `Clearing ${limit} messages in ${duration}.`
      } else {
        this.props.description = (this.DEV ? "DEV: " : "") + `Clearing ${limit} messages in ${duration}.`
      }
    }
  }
}
