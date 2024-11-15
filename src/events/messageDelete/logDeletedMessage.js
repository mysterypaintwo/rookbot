const { logsChannel } = require('../../../config.json'); // Import logChannel ID
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

/**
 * Logs deleted messages from the server.
 * @param {import('discord.js').Client} client
 * @param {import('discord.js').Message} message
 */
module.exports = async (client, message) => {
  // Ignore messages from bots
  if (message.author?.bot) return;

  // Ensure the message was from a server
  const guild = message.guild;
  if (!guild) return;

  // Fetch the log channel using its ID
  const logChannelObject = guild.channels.cache.get(logsChannel);

  // Prepare the log embed
  const embed = new EmbedBuilder()
    .setColor('#FF0000') // Red for message deletion
    .setTitle('🗑️ Message Deleted')
    .addFields(
      { name: 'Author', value: `${message.author?.displayName || 'Unknown'} / ${message.author?.tag || 'Unknown'} (${message.author?.id || 'Unknown'})`, inline: false },
      { name: 'Channel', value: `<#${message.channel.id}> (${message.channel.id})`, inline: false },
      { name: 'Message Content', value: message.content || '*(No content)*', inline: false }
    )
    .setTimestamp()
    .setFooter({ text: `Message ID: ${message.id}` });

  // Send the embed to the log channel, if found and valid
  if (logChannelObject?.isTextBased()) {
    await logChannelObject.send({ embeds: [embed] });
  } else {
    console.warn(
      'Log channel not found or not a text-based channel. Logging to console instead.'
    );
    console.log(embed.toJSON());
  }

  // Optional: Save the deleted message to a log file
  const logFilePath = path.join(__dirname, '..', '..', 'deletedMessages.log');
  const logEntry = [
    `[${new Date().toISOString()}]`,
    `Author: ${message.author?.tag || 'Unknown'} (${message.author?.id || 'Unknown'})`,
    `Channel: ${message.channel.name} (${message.channel.id})`,
    `Content: ${message.content || '(No content)'}`,
    `Message ID: ${message.id}`,
  ].join('\n') + '\n\n';

  // Append the log entry to the file
  fs.appendFileSync(logFilePath, logEntry, 'utf8');
};
