const { PermissionFlagsBits } = require('discord.js')
const { RookCommand } = require('../../classes/command/rcommand.class')
const { RookEmbed } = require('../../classes/embed/rembed.class')
const unready = require('../../events/unready/exit')
const colors = require('../../dbs/colors.json')

// Multiple messages

module.exports = class ExitCommand extends RookCommand {
  constructor() {
    let comprops = {
      name: "exit",
      category: "app",
      description: "Exit rookbot",
      permissionsRequired: [PermissionFlagsBits.ManageMessages], // Restrict to staff
      botPermissions: [PermissionFlagsBits.SendMessages], // Ensure bot can send messages
    }
    let props = {
      title: { text: "Exit", emoji: "⏹️" },
      color: colors["bad"]
    }
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
  async execute(client, interaction, cmd) {


    console.log(`!!! Bot Exit by: ${interaction.member.user.tag} !!!`)

    this.props.description = `Exiting <@${client.user.id}>`

    // Entities
    let entities = {
      bot: { name: client.user.name, avatar: client.user.avatarURL(), username: client.user.username },
      user: { name: interaction.user.displayName, avatar: interaction.user.avatarURL(), username: interaction.user.username }
    }
    // Players
    this.props.players = {
      user: entities.user,
      target: entities.bot
    }



    this.send(interaction, new RookEmbed(this.props))

    await unready(client)

    console.log(`!!! EXIT`)
    process.exit(1337)
  }
}
