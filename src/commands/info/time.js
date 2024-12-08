const { RookCommand } = require('../../classes/command/rcommand.class.js')
const tz = require('timezone')

module.exports = class TimeCommand extends RookCommand {
  constructor() {
    let comprops = {
      name: "time",
      category: "info",
      description: "Time"
    }
    let props = {
      title: {
        text: "Time"
      }
    }

    super(
      {...comprops},
      {...props}
    )
  }

  async action(client, interaction, cmd, options) {
    const now = Date.now()
    const tzs = [
      "Australia/Perth",  // + 8
      "Australia/Adelaide", // + 930
      "Australia/Sydney",   // +10
      "Pacific/Auckland",   // +12
      "America/Los_Angeles" // - 7
    ]
    const mytz = tz(
      require("timezone/en_AU"),
      require("timezone/en_US"),
      require("timezone/Australia"),
      require("timezone/Pacific/Auckland"),
      require("timezone/America/Los_Angeles")
    )

    this.props.description = "```"

    for(let zone of tzs) {
      let locale = zone.includes("America") ? "en_US" : "en_AU"
      let tmp = mytz(now, locale, "%Z: %x %T", zone)
      console.log(tmp)
      this.props.description += tmp + "\n"
    }
    this.props.description += "```" + "\n"

    let tmp = `Local: <t:${Math.floor(now / 1000)}:f>`
    this.props.description += tmp
    console.log(tmp)

    return !this.error
  }
}
