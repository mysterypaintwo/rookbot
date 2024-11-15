const { EmbedBuilder } = require('discord.js');

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    // Get the expression from the command arguments
    const expression = interaction.options.get('expression').value;

    // Try to evaluate the expression
    try {
      // Evaluate the mathematical expression
      const result = eval(expression); // Use eval to evaluate the expression

      // Create the response embed
      const embed = new EmbedBuilder()
        .setColor('#00FF00') // Green color for success
        .setTitle('Calculator Result')
        .addFields(
          { name: 'Expression', value: expression, inline: true },
          { name: 'Result', value: result.toString(), inline: true }
        )
        .setTimestamp()
        .setFooter({ text: `Requested by ${interaction.user.tag}` });

      // Send the embed as a reply to the command
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.log(`Error calculating: ${error}`);
      // If there is an error, inform the user
      await interaction.reply("There was an error calculating the expression. Please make sure your input is valid.");
    }
  },

  name: 'calc',
  description: 'Performs basic arithmetic calculations (e.g., 2+2, 3*5, etc.)',
  options: [
    {
      name: 'expression',
      description: 'The arithmetic expression you want to calculate.',
      type: 3, // Type 3 is for String input
      required: true,
    },
  ],
};
