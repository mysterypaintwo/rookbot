const { Client, EmbedBuilder, GuildMember } = require('discord.js');
const fs = require('fs');
const path = require('path');

/**
 * Logs changes to a user's nickname in the server.
 * @param {Client} client
 * @param {GuildMember} oldMember
 * @param {GuildMember} newMember
 */
module.exports = async (client, oldMember, newMember) => {
  try {
    // Check if the nickname has changed
    if (oldMember.nickname === newMember.nickname) {
      console.warn('No nickname change detected.');
      return;
    }

    // Ensure the member is in a guild
    if (!newMember.guild) {
      console.warn('GuildMemberUpdate occurred outside of a guild:', newMember);
      return;
    }

    // Prepare the log embed
    const embed = new EmbedBuilder()
      .setColor('#FFD700') // Gold color for nickname changes
      .setTitle('✏️ Nickname Changed')
      .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true, size: 128 })) // User's profile picture
      .addFields(
        { name: 'User', value: `<@${newMember.user.id}> (ID: ${newMember.user.id})`, inline: false },
        { name: 'Old Nickname', value: oldMember.nickname ?? 'No nickname', inline: false },
        { name: 'New Nickname', value: newMember.nickname ?? newMember.user.displayName, inline: false }, // Use username if nickname is undefined
        { name: 'Guild', value: `${newMember.guild.name} (ID: ${newMember.guild.id})`, inline: false }
      )
      .setTimestamp()
      .setFooter({ text: `User ID: ${newMember.user.id}` });

    // Fetch the log channel using its ID
    const guildID = newMember.guild.id;
    const guildChannels = require(`../../dbs/${guildID}/channels.json`);
    const logChannelObject = newMember.guild.channels.cache.get(guildChannels["logging"]);

    // Send the embed to the log channel, if found and valid
    if (logChannelObject?.isTextBased()) {
      await logChannelObject.send({ embeds: [embed] });
    } else {
      console.warn('Log channel not found or not a text-based channel.');
    }

    // Optional: Save the nickname change to a log file
    const logFilePath = path.join(__dirname, '..', '..', 'nicknameChanges.log');
    const logEntry = [
      `[${new Date().toISOString()}]`,
      `User: ${newMember.user.tag} (ID: ${newMember.user.id})`,
      `Guild: ${newMember.guild.name} (ID: ${newMember.guild.id})`,
      `Old Nickname: ${oldMember.nickname ?? 'No nickname'}`,
      `New Nickname: ${newMember.nickname ?? newMember.user.displayName}`, // Use username if nickname is undefined
      `User ID: ${newMember.user.id}`,
    ].join('\n') + '\n\n';

    // Append the log entry to the file
    fs.appendFileSync(logFilePath, logEntry, 'utf8');
  } catch (error) {
    console.error('Error in logNameChange handler:', error);
  }
};