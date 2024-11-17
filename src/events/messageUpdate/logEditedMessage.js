import logsChannel from '../../../config.json' with { type: "json" }
import { EmbedBuilder } from 'discord.js'
import fs from 'fs'
import path from 'path'

/**
 * Logs edited messages from the server.
 * @param {import('discord.js').Client} client
 * @param {import('discord.js').Message} oldMessage
 * @param {import('discord.js').Message} newMessage
 */
let logEditedMessage = async (client, oldMessage, newMessage) => {
  try {
    // Check for invalid or undefined data
    if (!newMessage) {
      console.warn('MessageUpdate event received invalid data:', { oldMessage, newMessage });
      return;
    }

    // Ensure the message is in a guild and not from a bot
    if (!newMessage.guild) {
      console.warn('MessageUpdate occurred outside of a guild:', newMessage);
      return;
    }
    if (newMessage.author?.bot) return;

    // Fetch full messages if necessary
    if (oldMessage.partial) {
      try {
        oldMessage = await oldMessage.fetch();
      } catch (err) {
        console.error('Failed to fetch old message:', err);
        return;
      }
    }

    if (newMessage.partial) {
      try {
        newMessage = await newMessage.fetch();
      } catch (err) {
        console.error('Failed to fetch new message:', err);
        return;
      }
    }

    // Handle cases where the old or new content is unavailable
    const oldContent = oldMessage.content ?? '*(Content unavailable)*';
    const newContent = newMessage.content ?? '*(Content unavailable)*';

    // Skip if the content hasn't changed
    if (oldContent === newContent) {
      console.warn('No content change detected.');
      return;
    }

    // Fetch the log channel using its ID
    const logChannelObject = newMessage.guild.channels.cache.get(CONFIG.logsChannel);

    // Prepare the log embed
    const embed = new EmbedBuilder()
      .setColor('#FFA500') // Orange for message updates
      .setTitle('✏️ Message Edited')
      .setThumbnail(newMessage.author?.displayAvatarURL({ dynamic: true, size: 128 })) // Add user's profile picture
      .addFields(
        { name: 'Author', value: `<@${newMessage.author.id}> (ID: ${newMessage.author.id})`, inline: false },
        { name: 'Channel', value: `<#${newMessage.channel.id}>`, inline: false },
        { name: 'Old Content', value: oldContent, inline: false },
        { name: 'New Content', value: newContent, inline: false }
      )
      .setTimestamp()
      .setFooter({ text: `Message ID: ${newMessage.id}` });

    // Send the embed to the log channel, if found and valid
    if (logChannelObject?.isTextBased()) {
      await logChannelObject.send({ embeds: [embed] });
    } else {
      console.warn('Log channel not found or not a text-based channel.');
    }

    // Optional: Save the edited message to a log file
    const logFilePath = path.join(__dirname, '..', '..', 'editedMessages.log');
    const logEntry = [
      `[${new Date().toISOString()}]`,
      `Author: ${newMessage.author.tag} (ID: ${newMessage.author.id})`,
      `Channel: #${newMessage.channel.name}`,
      `Old Content: ${oldContent}`,
      `New Content: ${newContent}`,
      `Message ID: ${newMessage.id}`,
    ].join('\n') + '\n\n';

    // Append the log entry to the file
    fs.appendFileSync(logFilePath, logEntry, 'utf8');
  } catch (error) {
    console.error('Error in logEditedMessage handler:', error);
  }
};

export default logEditedMessage
