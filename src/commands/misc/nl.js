const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'nl',
  description: 'Posts a rainbow divider line.',
  
  /**
   * @param {import('discord.js').Interaction} interaction
   */
  callback: async (client, interaction) => {
    // Defer the reply silently (acknowledges the interaction without user notification)
    await interaction.deferReply({ ephemeral: true });

    try {
      // Create the embed with the rainbow divider line image
      const embed = new EmbedBuilder()
        .setColor('#FF00FF') // Set a vibrant color for the embed
        .setImage('https://cdn.discordapp.com/attachments/565312923271168000/985473102702071838/divider-line.gif');

      // Send the embed to the channel
      const channel = interaction.channel; // Get the channel where the command was used
      await channel.send({ embeds: [embed] });

      // Optionally end the interaction without a visible message
      await interaction.deleteReply();
    } catch (error) {
      console.error('Error handling /nl command:', error);

      // Respond with an error message if something goes wrong
      await interaction.followUp({
        content: 'An error occurred while posting the rainbow line. Please try again later.',
        ephemeral: true,
      });
    }
  },
};
