const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

/**
 * Logs nickname or username changes on the server.
 * @param {Client} client
 * @param {GuildMember} oldMember
 * @param {GuildMember} newMember
 */
module.exports = async (client, oldMember, newMember) => {
  try {
    console.log('guildMemberUpdate event triggered'); // Confirm event is firing

    // Check if the nickname or username has changed
    const oldNickname = oldMember.nickname || '(No Nickname)';
    const newNickname = newMember.nickname || '(No Nickname)';
    const oldUsername = oldMember.user.username;
    const newUsername = newMember.user.username;

    // Log if either nickname or username has changed
    if (oldNickname === newNickname && oldUsername === newUsername) {
      console.log('No name change detected'); // Log when there is no change
      return;
    }

    console.log(`Old Nickname: ${oldNickname}, New Nickname: ${newNickname}`);
    console.log(`Old Username: ${oldUsername}, New Username: ${newUsername}`);

    // Fetch the log channel using its ID
    const guildID = newMember.guild.id;
    const guildChannels = require(`../../dbs/${guildID}/channels.json`);
    const logChannelObject = newMember.guild.channels.cache.get(guildChannels["logging"]);

    // Prepare the log embed
    const embed = new EmbedBuilder()
      .setColor('#00FF00') // Green for name updates
      .setTitle('🔄 Name Change Detected')
      .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true, size: 128 })) // Add user's profile picture
      .addFields(
        { name: 'User', value: `<@${newMember.user.id}> (ID: ${newMember.user.id})`, inline: false },
        { name: 'Old Nickname', value: oldNickname, inline: false },
        { name: 'New Nickname', value: newNickname, inline: false },
        { name: 'Old Username', value: oldUsername, inline: false },
        { name: 'New Username', value: newUsername, inline: false }
      )
      .setTimestamp()
      .setFooter({ text: `User ID: ${newMember.user.id}` });

    // Send the embed to the log channel, if found and valid
    if (logChannelObject?.isTextBased()) {
      await logChannelObject.send({ embeds: [embed] });
    } else {
      console.warn('Log channel not found or not a text-based channel.');
    }

    // Optional: Save the name change to a log file
    const logFilePath = path.join(__dirname, '..', '..', 'nameChanges.log');
    const logEntry = [
      `[${new Date().toISOString()}]`,
      `User: ${newMember.user.tag} (ID: ${newMember.user.id})`,
      `Old Nickname: ${oldNickname}`,
      `New Nickname: ${newNickname}`,
      `Old Username: ${oldUsername}`,
      `New Username: ${newUsername}`,
    ].join('\n') + '\n\n';

    // Append the log entry to the file
    fs.appendFileSync(logFilePath, logEntry, 'utf8');
  } catch (error) {
    console.error('Error in logNameChange handler:', error);
  }
};
