import { Client, EmbedBuilder, MessageComponentInteraction } from 'discord.js'

let func = {
  name: 'botsrc',
  description: 'Links to the GitHub repository of rookbot.',

  /**
   * Sends an embed message with a link to the bot\'s GitHub repository.
   * @param {Client} client
   * @param {MessageComponentInteraction} interaction
   */
  execute: async (client, interaction) => {
    // Acknowledge the interaction
    await interaction.deferReply();

    // Create the embed with the link to the GitHub repository
    const embed = new EmbedBuilder()
      .setTitle('rookbot GitHub Repository')
      .setDescription('Want to see how rookbot works? Check out its source code on GitHub!')
      .setURL('https://github.com/mysterypaintwo/rookbot')
      .setColor('Random')
      .setFields(
        {
          name: 'rookbot on GitHub',
          value: 'Explore the source code, contribute, or learn more about how rookbot operates. Feel free to fork, report issues, or submit pull requests!',
          inline: false,
        },
        {
          name: 'Link to Repository',
          value: '[Click here to visit the GitHub repository!](https://github.com/mysterypaintwo/rookbot)',
          inline: false,
        }
      )
      .setTimestamp()
      .setFooter({
        text: 'Check out the bot\'s repository for more!',
        iconURL: 'https://github.com/favicon.ico'
      });

    // Send the embed to the channel
    await interaction.editReply({ embeds: [embed] });
  },
};

export default func
