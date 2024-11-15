const { logsChannel } = require('../../../config.json'); // Import logChannel ID
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

/**
 * Logs edited messages from the server.
 * @param {import('discord.js').Client} client
 * @param {import('discord.js').Message} oldMessage
 * @param {import('discord.js').Message} newMessage
 */
module.exports = async (client, oldMessage, newMessage) => {
  // Ignore messages from bots or if content hasn't changed
  if (oldMessage.author?.bot || oldMessage.content === newMessage.content) return;

  // Ensure the message was from a server
  const guild = oldMessage.guild;
  if (!guild) return;

  // Fetch the log channel using its ID
  const logChannelObject = guild.channels.cache.get(logsChannel);

  // Prepare the log embed
  const embed = new EmbedBuilder()
    .setColor('#FFA500') // Orange for message updates
    .setTitle('✏️ Message Edited')
    .setThumbnail(oldMessage.author?.displayAvatarURL({ dynamic: true, size: 128 })) // Add user's profile picture
    .addFields(
      { name: 'Author', value: `${oldMessage.author?.username || 'Unknown'} / ${oldMessage.author?.tag || 'Unknown'} (${oldMessage.author?.id || 'Unknown'})`, inline: false },
      { name: 'Channel', value: `<#${oldMessage.channel.id}> (${oldMessage.channel.id})`, inline: false },
      { name: 'Old Content', value: oldMessage.content || '*(No content)*', inline: false },
      { name: 'New Content', value: newMessage.content || '*(No content)*', inline: false }
    )
    .setTimestamp()
    .setFooter({ text: `Message ID: ${oldMessage.id}` });

  // Send the embed to the log channel, if found and valid
  if (logChannelObject?.isTextBased()) {
    await logChannelObject.send({ embeds: [embed] });
  } else {
    console.warn(
      'Log channel not found or not a text-based channel. Logging to console instead.'
    );
    console.log(embed.toJSON());
  }

  // Optional: Save the edited message to a log file
  const logFilePath = path.join(__dirname, '..', '..', 'editedMessages.log');
  const logEntry = [
    `[${new Date().toISOString()}]`,
    `Author: ${oldMessage.author?.tag || 'Unknown'} (${oldMessage.author?.id || 'Unknown'})`,
    `Channel: ${oldMessage.channel.name} (${oldMessage.channel.id})`,
    `Old Content: ${oldMessage.content || '(No content)'}`,
    `New Content: ${newMessage.content || '(No content)'}`,
    `Message ID: ${oldMessage.id}`,
  ].join('\n') + '\n\n';

  // Append the log entry to the file
  fs.appendFileSync(logFilePath, logEntry, 'utf8');
};
