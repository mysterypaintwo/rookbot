const { Client, GuildMember } = require('discord.js');
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
    // Ensure the member's data is fully fetched
    const fetchedMember = await newMember.guild.members.fetch(newMember.user.id);

    // Fetch the log channel using the fetchedMember's guild ID
    const guildID = fetchedMember.guild.id;
    const guildChannels = require(`../../dbs/${guildID}/channels.json`);
    const logChannel = client.channels.cache.get(guildChannels["logging-members"]);

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
          value: `[${fetchedMember.user.tag}](https://discord.com/users/${fetchedMember.user.id}) (ID: ${fetchedMember.user.id})`,
        },
        {
          name: 'Joined At',
          value: fetchedMember.joinedAt
            ? fetchedMember.joinedAt.toISOString()
            : 'Unknown', // Handle cases where joinedAt is null
        },
        {
          name: 'Guild',
          value: fetchedMember.guild.name,
        },
      ],
      footer: {
        msg: `User ID: ${fetchedMember.user.id}`,
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
      `User: ${fetchedMember.user.tag} (ID: ${fetchedMember.user.id})`,
      `Guild: ${fetchedMember.guild.name} (ID: ${fetchedMember.guild.id})`,
      `Event: Member Joined`,
      `User ID: ${fetchedMember.user.id}`,
    ].join('\n') + '\n\n';

    // Append the log entry to the file
    fs.appendFileSync(logFilePath, logEntry, 'utf8');
  } catch (error) {
    console.error('Error logging new member:', error);
  }
};
