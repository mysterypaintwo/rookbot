import { logsChannel } from '../../../config.json' with { type: "json" }
import { Client, Message } from 'discord.js'
import fs from 'fs'
import path from 'path'

/**
 * Logs deleted messages from the server.
 * @param {Client} client
 * @param {Message} deletedMessage
 */
let logDeletedMessages = async (client, deletedMessage) => {
  try {
    // If the message is partial, fetch the full message (if possible)
    if (deletedMessage.partial) {
      deletedMessage = await deletedMessage.fetch();
    }

    // Skip logging system messages or messages with no content
    if (deletedMessage.system || !deletedMessage.content) {
      return;
    }

    // Fetch the log channel using the logsChannel ID
    const logChannel = client.channels.cache.get(CONFIG.logsChannel);

    if (!logChannel || !logChannel.isTextBased()) {
      console.warn('Log channel not found or is not text-based.');
      return;
    }

    // Construct log message
    const logEmbed = {
      color: 0xff0000,
      title: '🚮 Message Deleted',
      fields: [
        {
          name: 'Author',
          value: `<@${deletedMessage.author.id}> (ID: ${deletedMessage.author.id})`,
          inline: false,
        },
        {
          name: 'Channel',
          value: `<#${deletedMessage.channel.id}>`,
          inline: false,
        },
        {
          name: 'Content',
          value: deletedMessage.content || '*No content*',
          inline: false,
        },
      ],
      footer: {
        text: `Message ID: ${deletedMessage.id}`,
      },
      timestamp: new Date(),
    };

    // Send the log embed to the log channel
    await logChannel.send({ embeds: [logEmbed] });


    // Optional: Save the deleted message to a log file
    const logFilePath = path.join(__dirname, '..', '..', 'deletedMessages.log');
    const logEntry = [
      `[${new Date().toISOString()}]`,
      `Author: ${deletedMessage.author.tag} (ID: ${deletedMessage.author.id})`,
      `Channel: #${deletedMessage.channel.name}`,
      `Content: ${deletedMessage.content}`,
      `Message ID: ${deletedMessage.id}`,
    ].join('\n') + '\n\n';

    // Append the log entry to the file
    fs.appendFileSync(logFilePath, logEntry, 'utf8');
  } catch (error) {
    console.error('Error logging deleted message:', error);
  }
};

export default logDeletedMessages
