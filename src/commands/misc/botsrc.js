const { RookEmbed } = require('../../classes/embed/rembed.class.js')

module.exports = {
  name: 'botsrc',
  description: 'Links to the GitHub repository of rookbot.',

  /**
   * Sends an embed message with a link to the bot\'s GitHub repository.
   * @param {Client} client
   * @param {Interaction} interaction
   */
  execute: async (client, interaction) => {
    // Acknowledge the interaction
    await interaction.deferReply();

    // Create the embed with the link to the GitHub repository
    let props = {
      title: {
        text: "rookbot GitHub Repository",
        url: "https://github.com/mysterypaintwo/rookbot"
      },
      description: "Want to see how rookbot works? Check out its source code on GitHub!",
      fields: [
        {
          name: 'rookbot on GitHub',
          value: 'Explore the source code, contribute, or learn more about how rookbot operates. Feel free to fork, report issues, or submit pull requests!',
          inline: false
        },
        {
          name: 'Link to Repository',
          value: '[Click here to visit the GitHub repository!](https://github.com/mysterypaintwo/rookbot)',
          inline: false
        }
      ],
      footer: {
        msg: "Check out the bot's repository for more!",
        image: "https://github.com/favicon.ico"
      }
    }
    const embed = new RookEmbed(props)

    // Send the embed to the channel
    await interaction.editReply({ embeds: [ embed ] });
  }
};
