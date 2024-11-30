const { Client, GuildMember } = require('discord.js')
const fs = require('fs')
const path = require('path')
const { RookEmbed } = require('../../classes/embed/rembed.class')
const colors = require('../../dbs/colors.json')

/**
 * Logs when a member leaves the server and saves it to a log file.
 * @param {Client} client
 * @param {GuildMember} oldMember
 */
module.exports = async (client, oldMember) => {
  try {
    // Fetch the log channel using the oldMember's guild ID
    const guildID = oldMember.guild.id
    const guildChannels = require(`../../dbs/${guildID}/channels.json`)
    const logChannel = client.channels.cache.get(guildChannels["logging-members"])

    if (!logChannel || !logChannel.isTextBased()) {
      console.warn('Log channel not found or is not text-based.')
      return
    }

    // Prepare the log embed
    const logEmbed = new RookEmbed({
      color: colors["bad"], // Red for member leaving
      title: {
        text: '🚶‍♂️🚪 [Log] Member Left'
      },
      players: {
        user: {
          name: oldMember.user.displayName,
          avatar: oldMember.user.displayAvatarURL( { dynamic: true, size: 128 } )
        },
        target: {
          name: oldMember.user.displayName,
          avatar: oldMember.user.displayAvatarURL( { dynamic: true, size: 128 } )
        }
      },
      fields: [
        {
          name: 'Left Member',
          value: `[${oldMember.user.tag}](https://discord.com/users/${oldMember.user.id}) (ID: ${oldMember.user.id})`
        },
        {
          name: 'Left At',
          value: new Date().toISOString()
        },
        {
          name: 'Guild',
          value: oldMember.guild.name
        }
      ],
      footer: {
        msg: `User ID: ${oldMember.user.id}`,
      },
      timestamp: true
    })

    // Send the log embed to the log channel
    await logChannel.send({ embeds: [logEmbed] });

    // Save the leaving member to a log file
    const logFilePath = path.join(
      __dirname,
      '..',
      '..',
      'botlogs',
      'memberChanges.log'
    )
    const logEntry = [
      `[${new Date().toISOString()}]`,
      `User: ${oldMember.user.tag} (ID: ${oldMember.user.id})`,
      `Guild: ${oldMember.guild.name} (ID: ${oldMember.guild.id})`,
      `Event: Member Left`,
      `User ID: ${oldMember.user.id}`
    ].join('\n') + '\n\n'

    // Append the log entry to the file
    fs.appendFileSync(logFilePath, logEntry, 'utf8')
  } catch (error) {
    console.error('Error logging member leave:', error)
  }
}
