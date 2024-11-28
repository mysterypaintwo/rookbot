const { Client, EmbedBuilder, GuildMember } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { RookEmbed } = require('../../classes/embed/rembed.class');
const colors = require('../../dbs/colors.json')

/**
 * Logs when a new member joins the server and saves it to a log file.
 * @param {Client} client
 * @param {GuildMember} newMember
 */
module.exports = async (client, newMember) => {
  try {
    // Fetch the log channel using the newMember's guild ID
    const guildID = newMember.guild.id;
    const guildChannels = require(`../../dbs/${guildID}/channels.json`);
    const logChannel = client.channels.cache.get(guildChannels["logging"]);

    if (!logChannel || !logChannel.isTextBased()) {
      console.warn('Log channel not found or is not text-based.');
      return;
    }

    // Prepare the log embed
    const logEmbed = new RookEmbed({
      color: colors["good"], // Green for new members joining
      title: {
        text: '👋 New Member Joined',
      },
      players: {
        user: {
          name: newMember.user.displayName,
          avatar: newMember.user.displayAvatarURL( { dynamic: true, size: 128 } )
        },
        target: {
          name: newMember.user.displayName,
          avatar: newMember.user.displayAvatarURL( { dynamic: true, size: 128 } )
        }
      },
      fields: [
        {
          name: 'New Member',
          value: `<@${newMember.user.id}> (ID: ${newMember.user.id})`,
        },
        {
          name: 'Joined At',
          value: newMember.joinedAt.toISOString(),
        },
        {
          name: 'Guild',
          value: newMember.guild.name,
        },
      ],
      footer: {
        msg: `User ID: ${newMember.user.id}`,
      },
      timestamp: true,
    });

    // Send the log embed to the log channel
    await logChannel.send({ embeds: [logEmbed] });

    // Save the joining member to a log file
    const logFilePath = path.join(
      __dirname,
      '..',
      '..',
      'botlogs',
      'memberChanges.log'
    );
    const logEntry = [
      `[${new Date().toISOString()}]`,
      `User: ${newMember.user.tag} (ID: ${newMember.user.id})`,
      `Guild: ${newMember.guild.name} (ID: ${newMember.guild.id})`,
      `Event: Member Joined`,
      `User ID: ${newMember.user.id}`,
    ].join('\n') + '\n\n';

    // Append the log entry to the file
    fs.appendFileSync(logFilePath, logEntry, 'utf8');
  } catch (error) {
    console.error('Error logging new member:', error);
  }
};
