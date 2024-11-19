const { ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');
const { RookEmbed } = require('../../classes/embed/rembed.class');

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  execute: async (client, interaction) => {
    const PROFILE = require('../../PROFILE.json');
    const guildIDs = require('../../dbs/guilds.json');
    let DEV_MODE = PROFILE["profiles"][PROFILE["selectedprofile"]]?.DEV
    const guildID = interaction.guild.id;
    const guildChannels = require(`../../dbs/${guildID}/channels.json`);
    const targetUserInput = interaction.options.get('user-id').value;
    const timeoutDuration = Math.abs(interaction.options.get('duration-seconds').value); // Duration in seconds
    const reason = interaction.options.get('reason')?.value || 'No reason provided';

    // Make the initial reply private
    await interaction.deferReply({ ephemeral: true });

    // Extract user ID from mention (if it's a mention)
    const targetUserId = targetUserInput.replace(/[<@!>]/g, '');  // Remove <@>, <@!>, and >

    // Get the user to be timed out
    let targetUser;
    try {
      targetUser = await client.users.fetch(targetUserId);
    } catch (error) {
      let props = {
        color: "#FF0000",
        title: {
          text: "Error"
        },
        description: "User not found."
      }
      const embed = new RookEmbed(props)
      await interaction.editReply({ embeds: [ embed ], ephemeral: true });
      return;
    }

    // Get the guild member (to fetch nickname if present)
    const guildMember = interaction.guild.members.cache.get(targetUserId);

    try {
      // Convert the timeout duration from seconds to milliseconds
      const timeoutDurationMilliseconds = timeoutDuration * 1000;

      if (guildMember && !DEV_MODE) {
        // Set the timeout (mute and prevent interactions)
        await guildMember.timeout(timeoutDurationMilliseconds, reason);
      }

      // Determine the name to display (use nickname if available, otherwise default to tag or username)
      const targetUserName = guildMember?.nickname || targetUser.username;

      // Reply publicly in the channel to confirm the timeout
      let plural = "second" + (timeoutDuration != 1 ? "s" : "")

      let props = {
        color: "#00FF00",
        title: {
          text: "Success!"
        },
        description: `User **${targetUserName}** has been **timed out** for ${timeoutDuration} ${plural}. (${reason})`
      }
      const embed = new RookEmbed(props)
      interaction.channel.send({ embeds: [ embed ] });

      if (!DEV_MODE) {
        // Log the action in the logs channel (private)
        const logs = client.channels.cache.get(guildChannels["logging"]);
        if (logs) {
          let props = {
            color: "#FF8800",
            title: {
              text: "⏰ User Timeout"
            },
            fields: [
              { name: 'User',             value: `${targetUser}\n(ID: ${targetUserId})`,              inline: true },
              { name: 'Timeout By',       value: `${interaction.user}\n(ID: ${interaction.user.id})`, inline: true },
              { name: 'Reason',           value: reason,                                              inline: false },
              { name: 'Timeout Duration', value: `${timeoutDuration} ${plural}`,                      inline: true }
            ],
            footer: {
              msg: `Actioned by ${interaction.user.displayName}`
            }
          }
          const embed = new RookEmbed(props)

          logs.send({ embeds: [ embed ] });
        } else {
          console.log("Logs channel not found.");
        }
      }

      // Delete the deferred private reply to avoid it being left pending
      await interaction.deleteReply();
    } catch (error) {
      console.log(`There was an error when timing out the user: ${error.stack}`);
      let props = {
        color: "#FF0000",
        title: {
          text: "Error"
        },
        description: "I couldn't timeout that user."
      }
      const embed = new RookEmbed(props)
      await interaction.editReply({ embeds: [ embed ], ephemeral: true }); // Private error message
    }
  },

  name: 'timeout',
  description: 'Times out a user for a specified duration.',
  options: [
    {
      name: 'user-id',
      description: 'The ID of the user you want to timeout.',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'duration-seconds',
      description: 'The duration of the timeout (in seconds).',
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
    {
      name: 'reason',
      description: 'The reason for the timeout.',
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.ModerateMembers],
  botPermissions: [PermissionFlagsBits.ModerateMembers],
};
