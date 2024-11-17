import { PermissionFlagsBits, Client, MessageComponentInteraction } from 'discord.js'

let func = {
  /**
   *
   * @param {Client} client
   * @param {MessageComponentInteraction} interaction
   */
  execute: async (client, interaction) => {
    const targetChannel = interaction.options.getChannel('channel'); // Get the target channel
    const message = interaction.options.getString('message'); // Get the message content

    // Check if the bot has permissions to send messages in the target channel
    if (!targetChannel.permissionsFor(client.user).has(PermissionFlagsBits.SendMessages)) {
      await interaction.reply({
        content: `I don't have permission to send messages in ${targetChannel}.`,
        ephemeral: true,
      });
      return;
    }

    try {
      // Send the message in the specified channel
      await targetChannel.send(message);

      // Acknowledge the command
      await interaction.reply({
        content: `Message successfully sent to ${targetChannel}.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(`Error sending message to ${targetChannel.name}:`, error);
      await interaction.reply({
        content: `There was an error trying to send the message to ${targetChannel}.`,
        ephemeral: true,
      });
    }
  },

  name: 'say',
  description: 'Make the bot send a message in the specified channel.',
  options: [
    {
      name: 'channel',
      description: 'The channel to send the message in.',
      type: 7, // Type 7 is for channel input
      required: true,
    },
    {
      name: 'message',
      description: 'The message to send.',
      type: 3, // Type 3 is for string input
      required: true,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.ManageMessages], // Restrict to staff
  botPermissions: [PermissionFlagsBits.SendMessages], // Ensure bot can send messages
};

export default func
