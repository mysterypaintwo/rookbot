const { RookCommand } = require('../../classes/command/rcommand.class.js')

module.exports = class UptimeCommand extends RookCommand {
  constructor() {
    let comprops = {
      name: "uptime",
      category: "app",
      description: "Uptime"
    }
    let props = {
      caption: { text: "Uptime", emoji: "⏱️" }
    }
    super(
      {...comprops},
      {...props}
    )
  }
  async action(client, interaction) {
    function timeConversion(duration = 0) {
      const portions = [];
      const msInSec = 1000;
      const msInMin = msInSec * 60;
      const msInHour = msInMin * 60;
      const msInDay = msInHour * 24;

      const days = Math.trunc(duration / msInDay)
      if (days > 0) {
        portions.push(days + 'd')
        duration -= (days * msInDay)
      }

      const hours = Math.trunc(duration / msInHour)
      if (hours > 0) {
        portions.push(hours + 'h')
        duration -= (hours * msInHour)
      }

      const minutes = Math.trunc(duration / msInMin)
      if (minutes > 0) {
        portions.push(minutes + 'm')
        duration -= (minutes * msInMin)
      }

      const seconds = Math.trunc(duration / msInSec)
      if (seconds > 0) {
        portions.push(seconds + 's')
      }
      return portions.join(' ')
    }

    await interaction.deferReply()

    // Entities
    let entities = {
      bot: { name: client.user.name, avatar: client.user.avatarURL(), username: client.user.username }
    }
    // Players
    this.props.players = {
      user: entities.bot
    }

    const uptime = await client.uptime
    this.props.description = [
        `<@${client.user.id}> has been online for:`,
        await timeConversion(uptime)
    ]

    await interaction.deleteReply()
  }
}
