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

  async execute(client, interaction) {
    this.channel = await this.getChannel(client)

    if (interaction) {
      let isDeferred = interaction?.deferred && interaction.deferred
      let hasReply = interaction?.replied && interaction.replied
      if (
        !isDeferred &&
        !hasReply &&
        interaction.hasOwn("deferReply") &&
        typeof interaction.deferReply === "function"
      ) {
        // await interaction.deferReply()
      }
    }

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

    let this_embed = await new RookEmbed(client, this.props)
    await interaction.reply({ embeds: [ this_embed ] })
    this.null = true
    // if (interaction) {
    //   interaction.deleteReply()
    // }

    let command = await new UptimeCommand(client)
    await command.execute(client, interaction)

    await unready(client, interaction)

    console.log(`!!! EXIT`)
    process.exit(1337)
  }
}
