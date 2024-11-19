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
    let DEV_MODE = PROFILE["profiles"][PROFILE["profile"]]?.DEV
    const guildID = interaction.guild.id;
    const guildChannels = require(`../../dbs/${guildID}/channels.json`);
    const targetUserInput = interaction.options.get('user-id').value;
    const reason = interaction.options.get('reason')?.value || 'No reason provided';

    // Make the initial reply private
    await interaction.deferReply({ ephemeral: true });

    // Extract user ID from mention (if it's a mention)
    const targetUserId = targetUserInput.replace(/[<@!>]/g, '');  // Remove <@>, <@!>, and >

    // Get the user to be warned
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
      await interaction.editReply({ embeds: [ embed ], ephemeral: true }); // Private error message
      return;
    }

    // Check if the user is in the server (guild)
    const guildMember = interaction.guild.members.cache.get(targetUserId);
    if (!guildMember) {
      let props = {
        color: "#FF0000",
        title: {
          text: "Error"
        },
        description: "User is not in the server."
      }
      const embed = new RookEmbed(props)
      await interaction.editReply({ embeds: [ embed ], ephemeral: true }); // Private error message
      return;
    }

    // Attempt to warn the user
    try {
      // Determine the name to display
      const targetUserName = guildMember?.nickname || targetUser.username;

      // Reply publicly in the channel to confirm the warning
      let props = {
        color: "#00FF00",
        title: {
          text: "Success!"
        },
        description: `User **${targetUserName}** has been **warned**. (${reason})`
      }
      const embed = new RookEmbed(props)
      interaction.channel.send({ embeds: [ embed ] });

      if (!DEV_MODE) {
        // Try to DM the user about the warning (private)
        try {
          let props = {
            color: "#FF0000",
            title: {
              text: "Warned"
            },
            description: `⚠️ You have been warned in the ${interaction.guild.name} server. (${reason})`
          }
          const embed = new RookEmbed(props)
          await targetUser.send({ embeds: [ embed ] });
        } catch (dmError) {
          console.log(`Failed to DM user: ${dmError.message}`);
          let props = {
            color: "#FF0000",
            title: {
              text: "Error"
            },
            description: "I couldn't send the DM to the user. They might have DMs disabled."
          }
          const embed = new RookEmbed(props)
          await interaction.followUp({ embeds: [ embed ], ephemeral: true }); // Private follow-up
        }
      }

      if (!DEV_MODE) {
        // Log the action in the logs channel (private)
        const logs = client.channels.cache.get(guildChannels["logging"]);
        if (logs) {
          let props = {
            color: "#FF8C00",
            title: {
              text: "⚠️ User Warned"
            },
            fields: [
              { name: 'User Warned',  value: `${targetUser}\n(ID: ${targetUserId})`,              inline: true },
              { name: 'Warned By',    value: `${interaction.user}\n(ID: ${interaction.user.id})`, inline: true },
              { name: 'Reason',       value: reason,                                              inline: false }
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
    } catch (error) {
      console.log(`There was an error when warning: ${error.stack}`);
      let props = {
        color: "#FF0000",
        title: {
          text: "Error"
        },
        description: "I couldn't warn that user."
      }
      const embed = new RookEmbed(props)
      await interaction.editReply({ embeds: [ embed ], ephemeral: true }); // Private error message
    }
  },

  name: 'warn',
  description: 'Warns a user in the server.',
  options: [
    {
      name: 'user-id',
      description: 'The ID of the user you want to warn.',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'reason',
      description: 'The reason for warning the user.',
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.ManageMessages],
  botPermissions: [PermissionFlagsBits.ManageMessages],
};
