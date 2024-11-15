const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'color',
  description: 'Displays information about a hex color code.',
  options: [
    {
      name: 'hex',
      description: 'A hex color code (e.g., #FF5733 or FF5733).',
      type: 3, // String
      required: true,
    },
  ],

  /**
   * @param {import('discord.js').Interaction} interaction
   */
  callback: async (client, interaction) => {
    const hexInput = interaction.options.getString('hex').replace('#', '').toUpperCase();

    // Validate hex string
    const hexRegex = /^[0-9A-F]{6}$/;
    if (!hexRegex.test(hexInput)) {
      const errorEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Error')
        .setDescription('Invalid hex color code. Please provide a valid 6-character hexadecimal string (e.g., #FF5733 or FF5733).')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      return;
    }

    // Convert hex to RGB
    const r = parseInt(hexInput.substring(0, 2), 16);
    const g = parseInt(hexInput.substring(2, 4), 16);
    const b = parseInt(hexInput.substring(4, 6), 16);

    // Create the embed
    const embed = new EmbedBuilder()
      .setColor(`#${hexInput}`) // Set the embed's color
      .setTitle('Color Information')
      .addFields(
        { name: 'Hex', value: `#${hexInput}`, inline: true },
        { name: 'RGB', value: `(${r}, ${g}, ${b})`, inline: true },
      )
      .setThumbnail(`https://singlecolorimage.com/get/${hexInput}/100x100`) // Displays a square of the color
      .setTimestamp();

    // Send the embed
    await interaction.reply({ embeds: [embed] });
  },
};
