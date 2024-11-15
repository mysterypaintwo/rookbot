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
  // Ensure the message was sent in a guild and is not from a bot
  if (!oldMessage.guild || oldMessage.author?.bot) return;

  // Handle cases where content is missing
  const oldContent = oldMessage.content || '*(Content unavailable)*';
  const newContent = newMessage.content || '*(Content unavailable)*';

  // Skip if the content hasn't changed
  if (oldContent === newContent) return;

  // Fetch the log channel using its ID
  const logChannelObject = oldMessage.guild.channels.cache.get(logsChannel);

  // Prepare the log embed
  const embed = new EmbedBuilder()
    .setColor('#FFA500') // Orange for message updates
    .setTitle('✏️ Message Edited')
    .setThumbnail(oldMessage.author?.displayAvatarURL({ dynamic: true, size: 128 })) // Add user's profile picture
    .addFields(
      { name: 'Author', value: `${oldMessage.author?.username || 'Unknown'} / ${oldMessage.author?.tag || 'Unknown'} (${oldMessage.author?.id || 'Unknown'})`, inline: false },
      { name: 'Channel', value: `<#${oldMessage.channel.id}> (${oldMessage.channel.id})`, inline: false },
      { name: 'Old Content', value: oldContent, inline: false },
      { name: 'New Content', value: newContent, inline: false }
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
    `Old Content: ${oldContent}`,
    `New Content: ${newContent}`,
    `Message ID: ${oldMessage.id}`,
  ].join('\n') + '\n\n';

  // Append the log entry to the file
  fs.appendFileSync(logFilePath, logEntry, 'utf8');
};
