const { Client, Message } = require('discord.js')
const fs = require('fs')
const path = require('path')
const { RookEmbed } = require('../../classes/embed/rembed.class')
const colors = require('../../dbs/colors.json')

/**
 * Logs deleted messages from the server.
 * @param {Client} client
 * @param {Message} deletedMessage
 */
module.exports = async (client, deletedMessage) => {
  try {
    // If the message is partial, fetch the full message (if possible)
    if (deletedMessage.partial) {
      deletedMessage = await deletedMessage.fetch()
    }

    // Skip logging system messages or messages with no content
    if (deletedMessage.system || !deletedMessage.content) {
      return
    }

    // Fetch the log channel using the deletedMessage's guild ID
    const guildID = deletedMessage.guild.id
    const guildChannels = require(`../../dbs/${guildID}/channels.json`)
    let log_type = "logging"
    let log_check = "logging-messages"
    if (log_check in guildChannels) {
      log_type = log_check
    }
    const logChannel = client.channels.cache.get(guildChannels[log_type])

    if (!logChannel || !logChannel.isTextBased()) {
      console.warn('Log channel not found or is not text-based.')
      return
    }

    // Prepare the log embed
    const logEmbed = new RookEmbed({
      color: colors["bad"], // Orange for message updates
      title: {
        text: '🚮 [Log] Message Deleted'
      },
      players: {
        user: {
          name: deletedMessage.author.displayName,
          avatar: deletedMessage.author.displayAvatarURL( { dynamic: true, size: 128 } )
        },
        target: {
          name: deletedMessage.author.displayName,
          avatar: deletedMessage.author.displayAvatarURL( { dynamic: true, size: 128 } )
        }
      },
      fields: [
        {
          name: 'Author',
          value: `<@${deletedMessage.author.id}>` + " " +
            `(ID: \`${deletedMessage.author.id}\`)`
        },
        {
          name: 'Channel',
          value: `<#${deletedMessage.channel.id}>`
        },
        {
          name: 'Content',
          value: deletedMessage.content || '*No content*'
        },
      ],
      footer: {
        msg: `Message ID: ${deletedMessage.id}`
      },
      timestamp: true
    })


    // Send the log embed to the log channel
    await logChannel.send({ embeds: [logEmbed] })

    // Optional: Save the deleted message to a log file
    const logFilePath = path.join(
      __dirname,
      '..',
      '..',
      'botlogs',
      'deletedMessages.log'
    )
    const logEntry = [
      `[${new Date().toISOString()}]`,
      `Author:     ${deletedMessage.author.tag} (ID: ${deletedMessage.author.id})`,
      `Channel:    #${deletedMessage.channel.name}`,
      `Content:    ${deletedMessage.content}`,
      `Message ID: ${deletedMessage.id}`,
      '--------------------------------'
    ].join('\n') + '\n\n'

    // Append the log entry to the file
    fs.appendFileSync(logFilePath, logEntry, 'utf8')
  } catch (error) {
    console.error('Error logging deleted message:', error)
  }
}
