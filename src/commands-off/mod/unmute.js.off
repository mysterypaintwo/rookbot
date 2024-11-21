const { RookEmbed } = require('../../classes/embed/rembed.class.js')

module.exports = {
  name: 'command',
  description: 'Command',

  execute: async (client, interaction) => {
    await interaction.deferReply()

    let props = {}

    const embed = new RookEmbed(props)

    await interaction.editReply({ embeds: [ embed ] })
  }
}
