const { RookCommand } = require('../../classes/command/rcommand.class.js')

module.exports = class UptimeCommand extends RookCommand {
  constructor(client) {
    let comprops = {
      name: "uptime",
      category: "app",
      description: "Uptime",
      flags: {
        user: "unapplicable",
        test: "basic"
      }
    }
    let props = {
      caption: { text: "Uptime", emoji: "⏱️" }
    }
    super(
      client,
      {...comprops},
      {...props}
    )
  }
  async action(client) {
    function timeConversion(duration = 0) {
      const portions = []
      const msInSec = 1000
      const msInMin = msInSec * 60
      const msInHour = msInMin * 60
      const msInDay = msInHour * 24

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

    const uptime = await client.uptime
    this.props.description = [
        `<@${client.user.id}> has been online for:`,
        await timeConversion(uptime)
    ]

    return !this.error
  }
}
