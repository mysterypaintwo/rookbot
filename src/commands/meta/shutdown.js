const { PermissionFlagsBits } = require('discord.js')
const { RookEmbed } = require('../../classes/embed/rembed.class')

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  execute: async (client, interaction) => {
    console.log(`!!! Bot Shutdown by: ${interaction.member.user.tag} !!!`)
    try {
      const pm2 = require('pm2')
      pm2.connect(function(err) {
        if (err) {
          console.log("🔴PM2: Error Connecting!")
          console.log(err)
          process.exit(2)
        }

        pm2.list(async (err, list) => {
          if (err) {
            console.log("🔴PM2: Error Listing Processes!")
          }

          for(let [, procItem] of Object.entries(list)) {
            if (procItem.name == "run") {
              await interaction.reply(
                {
                  content: `Restarting <@${client.user.id}>.`
                }
              )
              console.log(`!!! RESTART`)
              pm2.restart(procItem.name, (err, proc) => {
                pm2.disconnect()
              })
            }
          }
        })
      })
    } catch (err) {
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
          text: "Bot Shutdown!"
        },
        description: `Shutting down <@${client.user.id}>.`,
        players: players
      }
      let embed = new RookEmbed(props)
      await interaction.reply({ embeds: [ embed ] })
      console.log(`!!! SHUTDOWN`)
      process.exit(1337)
    }
  },

  name: 'shutdown',
  description: 'Shutdown (and restart if pm2) rookbot',
  permissionsRequired: [PermissionFlagsBits.ManageMessages], // Restrict to staff
  botPermissions: [PermissionFlagsBits.SendMessages], // Ensure bot can send messages
}
