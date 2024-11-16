const { logsChannel } = require('../../../config.json'); // Import the log channel ID

/**
 * Logs deleted messages from the server.
 * @param {import('discord.js').Client} client
 * @param {import('discord.js').Message} deletedMessage
 */
module.exports = async (client, deletedMessage) => {
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
    const logChannel = client.channels.cache.get(logsChannel);

    if (!logChannel || !logChannel.isTextBased()) {
      console.warn('Log channel not found or is not text-based.');
      return;
    }

    // Construct log message
    const logEmbed = {
      color: 0xff0000,
      title: '🚮 Message Deleted',
      description: `A message was deleted in <#${deletedMessage.channelId}>.`,
      fields: [
        {
          name: 'Author',
          value: `<@${deletedMessage.author.id}> (${deletedMessage.author.tag})`,
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
  } catch (error) {
    console.error('Error logging deleted message:', error);
  }
};
