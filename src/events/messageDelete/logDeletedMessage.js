const { Client, EmbedBuilder, Message } = require('discord.js');
const fs = require('fs');
const path = require('path');

/**
 * Logs deleted messages from the server.
 * @param {Client} client
 * @param {Message} deletedMessage
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
    const guildID = interaction.guild.id;
    const guildChannels = require(`../../dbs/${guildID}/channels.json`);
    const logChannel = client.channels.cache.get(guildChannels["logging"]);

    if (!logChannel || !logChannel.isTextBased()) {
      console.warn('Log channel not found or is not text-based.');
      return;
    }

    // Prepare the log embed
    const logEmbed = new EmbedBuilder()
      .setColor('#FF0000') // Orange for message updates
      .setTitle('🚮 Message Deleted')
      .setThumbnail(deletedMessage.author.displayAvatarURL({ dynamic: true, size: 128 })) // Add user's profile picture
      .addFields(
        { name: 'Author', value: `<@${deletedMessage.author.id}> (ID: ${deletedMessage.author.id})`, inline: false },
        { name: 'Channel', value: `<#${deletedMessage.channel.id}>`, inline: false },
        { name: 'Content', value: deletedMessage.content || '*No content*', inline: false }
      )
      .setTimestamp()
      .setFooter({ text: `Message ID: ${deletedMessage.id}` });

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
