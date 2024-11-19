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
    const channel = interaction.options.getChannel('channel');

    // Make the initial reply private
    await interaction.deferReply({ ephemeral: true });

    // Attempt to lock the channel
    try {
      if (!DEV_MODE) {
        // Lock the channel by denying the SEND_MESSAGES permission for @everyone
        await channel.permissionOverwrites.edit(
          interaction.guild.roles.everyone,
          {
            SendMessages: false
          }
        );
      }

      // Reply publicly in the channel to confirm the action
      let props = {
        color: "#00FF00",
        title: {
          text: "Success!"
        },
        description: `Channel <#${channel.id}> has been **locked**.`
      }
      const embed = new RookEmbed(props)
      interaction.channel.send({ embeds: [ embed ] });

      // Log the action in the logs channel (private)
      const logs = client.channels.cache.get(guildChannels["logging"]);
      if (logs) {
        let props = {
          color: "#FF0000",
          title: {
            text: "🔒 Channel Locked"
          },
          fields: [
            { name: 'Channel Locked', value: `<#${channel.id}>\n(ID: ${channel.id})`,    inline: true },
            { name: 'Locked By',      value: `${interaction.user}\n(ID: ${interaction.user.id})`, inline: true }
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
    } catch (error) {
      console.log(`There was an error when locking the channel: ${error.stack}`);
      let props = {
        color: "#FF0000",
        title: {
          text: "Error"
        },
        description: "I couldn't lock the channel."
      }
      const embed = new RookEmbed(props)
      await interaction.editReply({ embeds: [ embed ], ephemeral: true }); // Private error message
    }
  },

  name: 'lock',
  description: 'Locks a channel, preventing anyone from sending messages.',
  options: [
    {
      name: 'channel',
      description: 'The channel to lock.',
      type: ApplicationCommandOptionType.Channel,
      required: true,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.ManageChannels],
  botPermissions: [PermissionFlagsBits.ManageChannels],
};
