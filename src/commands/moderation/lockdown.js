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
    let DEV_MODE = PROFILE["profiles"][PROFILE["selectedprofile"]]?.DEV;
    const guildID = interaction.guild.id;
    const guildChannels = require(`../../dbs/${guildID}/channels.json`);

    const action = interaction.options.getString('action');
    const confirm = interaction.options.getBoolean('confirm');
    const channels = interaction.guild.channels.cache.filter(
      ch => ch.isTextBased() || ch.isVoiceBased()
    );

    // Make the initial reply private
    await interaction.deferReply({ ephemeral: true });

    if (!confirm) {
      return interaction.editReply({
        content: "Command not confirmed. Please confirm to proceed.",
        ephemeral: true,
      });
    }

    if (!['lock', 'unlock'].includes(action)) {
      return interaction.editReply({
        content: "Invalid action. Please use `lock` or `unlock`.",
        ephemeral: true,
      });
    }

    await interaction.followUp({
      content: `Starting to ${action} all channels. This may take a moment...`,
      ephemeral: true,
    });

    let processedCount = 0;
    let processedChannels = [];
    const channelPromises = channels.map(channel =>
      channel.permissionOverwrites
        .edit(interaction.guild.roles.everyone, {
          SendMessages: action === 'lock' ? false : null,
        })
        .then(() => {
          processedCount++;
          processedChannels.push(channel.id); // Log successful channel IDs
        })
        .catch(error => console.log(`Failed for ${channel.id}: ${error.message}`))
    );

    await Promise.allSettled(channelPromises);

    // Log the action in the logs channel (private)
    const logs = client.channels.cache.get(guildChannels["logging"]);
    if (logs) {
      const capitalizedAction = action.charAt(0).toUpperCase() + action.slice(1);
      const embed = new RookEmbed({
        color: action === 'lock' ? '#FF0000' : '#00FF00',
        title: {
          text: `🔒🔒 Lockdown \(${capitalizedAction}\)`
        },
        fields: [
          {
            name: `Public Channels ${action}ed`,
            value:
              processedChannels.length > 0
                ? processedChannels.map(id => `<#${id}>`).join('\n')
                : 'No channels were processed.',
          },
          {
            name: `Action Performed By`,
            value: `${interaction.user}\n(ID: ${interaction.user.id})`,
            inline: true,
          },
        ],
        footer: {
          msg: `Actioned by ${interaction.user.username}`,
        },
      });
      logs.send({ embeds: [embed] });
    } else {
      console.log("Logs channel not found.");
    }

    await interaction.editReply({
      content: `All channels have been **${action}ed** successfully! (${processedCount}/${channels.size} processed)`,
      ephemeral: true,
    });
  },

  name: 'lockdown',
  description: 'Locks or unlocks all channels for the @everyone role.',
  options: [
    {
      name: 'action',
      description: 'Specify whether to lock or unlock all channels.',
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        { name: 'Lock', value: 'lock' },
        { name: 'Unlock', value: 'unlock' },
      ],
    },
    {
      name: 'confirm',
      description: 'Boolean to confirm the action and avoid accidental execution.',
      type: ApplicationCommandOptionType.Boolean,
      required: true,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.ManageChannels],
  botPermissions: [PermissionFlagsBits.ManageChannels],
};
