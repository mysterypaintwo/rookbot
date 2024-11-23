const { PermissionFlagsBits } = require('discord.js')
const { RookEmbed } = require('../../classes/embed/rembed.class')
const unready = require('../../events/unready/exit')

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  execute: async (client, interaction) => {
    console.log(`!!! Bot Exit by: ${interaction.member.user.tag} !!!`)
    let players = {}
    players["user"] = {
      name: interaction.user.displayName,
      avatar: interaction.user.avatarURL(),
      username: interaction.user.username
    }
    players["target"] = {
      name: client.user.name,
      avatar: client.user.avatarURL()
    }
    let props = {
      color: "#FF0000",
      title: {
        text: "Bot Exit!"
      },
      description: `Exiting <@${client.user.id}>.`,
      players: players
    }
    let embed = new RookEmbed(props)
    await interaction.reply({ embeds: [ embed ] })

    await unready(client)

    console.log(`!!! EXIT`)
    process.exit(1337)
  },

  name: 'exit',
  description: 'Exit rookbot',
  permissionsRequired: [PermissionFlagsBits.ManageMessages], // Restrict to staff
  botPermissions: [PermissionFlagsBits.SendMessages], // Ensure bot can send messages
}
