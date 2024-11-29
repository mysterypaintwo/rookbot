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
    const reason = interaction.options.get('reason')?.value || 'No reason provided';

    // Make the initial reply private


    // Extract user ID from mention (if it's a mention)
    const targetUserId = targetUserInput.replace(/[<@!>]/g, '');  // Remove <@>, <@!>, and >

    try {
      if (!DEV_MODE) {
        // Unban the user
        await interaction.guild.bans.remove(targetUserId, reason);
      }

      // Get the user object for the unbanned user
      const targetUser = await client.users.fetch(targetUserId);

      // Reply publicly in the channel to confirm the unban
      let props = {
        color: "#00FF00",
        title: {
          text: "Success!"
        },
        description: `User **${targetUser.tag}** has been **unbanned**. (${reason})`
      }
      const embed = new RookEmbed(props)
      interaction.channel.send({ embeds: [ embed ] });

      if (!DEV_MODE) {
        // Log the action in the logs channel (private)
        const logs = client.channels.cache.get(guildChannels["logging"]);
        if (logs) {
          let props = {
            color: "#00FF00",
            title: {
              text: "✅ User Unbanned"
            },
            fields: [
              { name: 'User Unbanned',  value: `${targetUser}\n(ID: ${targetUserId})`,              inline: true },
              { name: 'Unbanned By',    value: `${interaction.user}\n(ID: ${interaction.user.id})`, inline: true },
              { name: 'Reason',         value: reason,                                              inline: false }
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

      // Delete the deferred private reply to stop the "thinking" state
      let props2 = {
        color: "#FF0000",
        title: {
          text: "Error"
        },
        description: `✅ User **${targetUserName}** successfully unbanned! (${reason})`
      }
      const embed2 = new RookEmbed(props2);
    } catch (error) {
      console.log(`There was an error when unbanning: ${error.stack}`);
      let props = {
        color: "#FF0000",
        title: {
          text: "Error"
        },
        description: "I couldn't unban that user."
      }
      const embed = new RookEmbed(props)
      await interaction.editReply({ embeds: [ embed ], ephemeral: true }); // Private error message
    }
  },

  name: 'unban',
  description: 'Unbans a user from the server.',
  options: [
    {
      name: 'user-id',
      description: 'The ID of the user you want to unban.',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'reason',
      description: 'The reason for unbanning the user.',
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.BanMembers],
  botPermissions: [PermissionFlagsBits.BanMembers],
};
