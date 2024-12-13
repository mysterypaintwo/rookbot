const { BotDevCommand } = require('../../classes/command/botdevcommand.class')
const UptimeCommand = require('../../commands/app/uptime.js')
const { RookEmbed } = require('../../classes/embed/rembed.class')
const unready = require('../../events/unready/exit')
const colors = require('../../dbs/colors.json')

// Multiple messages

/**
 * @class
 * @classdesc App Exit
 * @this {ExitCommand}
 * @extends {BotDevCommand}
 * @public
 */
module.exports = class ExitCommand extends BotDevCommand {
  constructor(client) {
    let comprops = {
      name: "exit",
      category: "app",
      description: "Exit rookbot",
      flags: {
        test: "basic"
      }
    }
    let props = {
      title: {
        emoji:  "⏹️",
        text:   "Exit"
      },
      color: colors["bad"]
    }
    super(
      client,
      {...comprops},
      {...props}
    )
  }

  async execute(client, interaction, cmd) {
    console.log(`!!! Bot Exit by: ${interaction.member.user.tag} !!!`)

    this.props.description = `Exiting <@${client.user.id}>`

    // Entities
    let entities = {
      bot: {
        name:     client.user.name,
        avatar:   client.user.avatarURL(),
        username: client.user.username
      },
      user: {
        name:     interaction.user.displayName,
        avatar:   interaction.user.avatarURL(),
        username: interaction.user.username
      }
    }
    // Players
    this.props.players = {
      user:   entities.user,
      target: entities.bot
    }

    let this_embed = new RookEmbed(client, this.props)
    await this_embed.init(client, this.props)
    await interaction.reply({ embeds: [ this_embed ] })

    let command = await new UptimeCommand()
    await command.execute(client)
    this.null = true

    await unready(client, this.profileName, interaction)

    console.log(`!!! EXIT`)
    process.exit(1337)
  }
}
