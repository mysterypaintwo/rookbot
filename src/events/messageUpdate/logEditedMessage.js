const { Client, Message } = require('discord.js')
const fs = require('fs')
const path = require('path')
const { RookEmbed } = require('../../classes/embed/rembed.class')
const colors = require('../../dbs/colors.json')

/**
 * Logs edited messages from the server.
 * @param {Client} client
 * @param {Message} oldMessage
 * @param {Message} newMessage
 */
module.exports = async (client, oldMessage, newMessage) => {
  try {
    // Check for invalid or undefined data
    if (!newMessage) {
      console.warn('MessageUpdate event received invalid data:', { oldMessage, newMessage })
      return
    }

    // Ensure the message is in a guild and not from a bot
    if (!newMessage.guild) {
      console.warn('MessageUpdate occurred outside of a guild:', newMessage)
      return
    }
    if (newMessage.author?.bot) {
      // console.warn(`Message update from bot:`, newMessage)
      return
    }

    // Fetch full messages if necessary
    if (oldMessage.partial) {
      try {
        oldMessage = await oldMessage.fetch()
      } catch (err) {
        console.error('Failed to fetch old message:', err)
        return
      }
    }

    if (newMessage.partial) {
      try {
        newMessage = await newMessage.fetch()
      } catch (err) {
        console.error('Failed to fetch new message:', err)
        return
      }
    }

    // Handle cases where the old or new content is unavailable
    const oldContent = oldMessage.content ?? '*(Content unavailable)*'
    const newContent = newMessage.content ?? '*(Content unavailable)*'

    // Skip if the content hasn't changed
    if (oldContent === newContent) {
      console.warn('No content change detected.')
      return
    }

    // Fetch the log channel using its ID
    const guildID = newMessage.guild.id
    const guildChannels = require(`../../dbs/${guildID}/channels.json`)
    let log_type = "logging"
    let log_check = "logging-messages"
    if (log_check in guildChannels) {
      log_type = log_check
    }
    const logChannel = client.channels.cache.get(guildChannels[log_type])

    const embed = new RookEmbed({
      color: colors["info"], // Orange for message updates
      title: {
        text: '✏️ [Log] Message Edited'
      },
      players: {
        user: {
          name: newMessage.author.displayName,
          avatar: newMessage.author.displayAvatarURL( { dyanmic: true, size: 128 } )
        },
        target: {
          avatar: newMessage.author.displayAvatarURL( { dyanmic: true, size: 128 } )
        }
      },
      fields: [
        {
          name: 'Author',
          value: `<@${newMessage.author.id}>` + " " +
            `(ID: \`${newMessage.author.id}\`)`
        },
        {
          name: 'Message',
          value: `${newMessage.url} (ID: \`${newMessage.id}\`)`
        },
        {
          name: 'Old Content',
          value: oldContent || '*No old content*' // Ensure there's always a default value
        },
        {
          name: 'New Content',
          value: newContent || '*No new content*' // Ensure there's always a default value
        },
      ],
      footer: {
        msg: `Message ID: ${newMessage.id}`
      },
      timestamp: true
    });

    // Send the embed to the log channel, if found and valid
    if (logChannel?.isTextBased()) {
      await logChannel.send({ embeds: [embed] })
    } else {
      console.warn('Log channel not found or not a text-based channel.')
    }

    // Optional: Save the edited message to a log file
    const logFilePath = path.join(
      __dirname,
      '..',
      '..',
      'botlogs',
      'editedMessages.log'
    )
    const logEntry = [
      `[${new Date().toISOString()}]`,
      `Author:      ${newMessage.author.tag} (ID: ${newMessage.author.id})`,
      `Channel:     #${newMessage.channel.name}`,
      `Old Content: ${oldContent}`,
      `New Content: ${newContent}`,
      `Message ID:  ${newMessage.id}`,
      '--------------------------------'
    ].join('\n') + '\n\n'

    // Append the log entry to the file
    fs.appendFileSync(logFilePath, logEntry, 'utf8')
  } catch (error) {
    console.error('Error in logEditedMessage handler:', error)
  }
}
