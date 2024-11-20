const { RookEmbed } = require('../../classes/embed/rembed.class.js')
const tz = require('timezone');

module.exports = {
  name: 'time',
  description: 'Time',

  execute: async (client, interaction) => {
    await interaction.deferReply()

    let props = {}

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

    props.description = "```"

    for(let zone of tzs) {
      let locale = zone.includes("America") ? "en_US" : "en_AU"
      let tmp = mytz(now, locale, "%Z: %x %T", zone)
      console.log(tmp)
      props.description += tmp + "\n"
    }
    props.description += "```" + "\n"

    let tmp = `Local: <t:${Math.floor(now / 1000)}:f>`
    props.description += tmp
    console.log(tmp)

    const embed = new RookEmbed(props)

    await interaction.editReply({ embeds: [ embed ] })
  }
}
