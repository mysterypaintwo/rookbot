const { PermissionFlagsBits } = require('discord.js')
const { RookCommand } = require('../../classes/command/rcommand.class')
const { RookEmbed } = require('../../classes/embed/rembed.class')
const unready = require('../../events/unready/exit')
const colors = require('../../dbs/colors.json')

// Multiple messages

module.exports = class ShutdownCommand extends RookCommand {
  constructor() {
    let comprops = {
      name: "shutdown",
      category: "app",
      description: "Shutdown (and restart if pm2) rookbot",
      permissionsRequired: [PermissionFlagsBits.ManageMessages], // Restrict to staff
      botPermissions: [PermissionFlagsBits.SendMessages] // Ensure bot can send messages
    }
    let props = {
      title: { text: "Bot Shutdown", emoji: "⏹️" },
      color: colors["bad"]
    }
    super(
      {...comprops},
      {...props}
    )
  }
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  async execute(client, interaction) {
    await interaction.deferReply();

    let action = "Shutting Down"

    console.log(`!!! Bot Shutdown by: ${interaction.member.user.tag} !!!`)
    let processed_pm2 = false
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
              action = "Restarting"
              console.log(`!!! RESTART`)
              pm2.restart(procItem.name, (err, proc) => {
                pm2.disconnect()
              })
            }
          }
        })
        processed_pm2 = true
      })
    } catch (err) {
      // do nothing
    }

    if (!processed_pm2) {
      // Entities
      let entities = {
        bot: { name: client.user.name, avatar: client.user.avatarURL(), username: client.user.username },
        user: { name: interaction.user.displayName, avatar: interaction.user.avatarURL(), username: interaction.user.username }
      }
      // Players
      this.props.players = {
        user: entities.user,
        target: entities.bot
      }

      await interaction.deleteReply();

      this.props.description = `${action} <@${client.user.id}>`
      this.send(interaction, new RookEmbed(this.props))

      console.log(`!!! SHUTDOWN`)

      await unready(client)

      process.exit(1337)
    }
  }
}
