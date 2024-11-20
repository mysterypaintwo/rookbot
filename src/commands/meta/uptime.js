const { RookEmbed } = require('../../classes/embed/rembed.class.js')

module.exports = {
  name: 'uptime',
  description: 'Uptime',

  execute: async (client, interaction) => {
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

    let props = {
      title: {
        text: "Uptime"
      }
    }

    const uptime = client.uptime
    props.description = [
        `<@${client.user.id}> has been online for:`,
        await timeConversion(uptime)
    ]

    const embed = new RookEmbed(props)

    await interaction.editReply({ embeds: [ embed ] })
  }
}
