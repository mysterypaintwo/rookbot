const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'justin',
  description: 'Displays an embed showcasing the developer\'s video games from their portfolio',
  
  /**
   * Sends an embed message showcasing the developer's video games.
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    // Acknowledge the interaction
    await interaction.deferReply();

    const embed = new EmbedBuilder()
      .setTitle('Developer Portfolio: Justin Bohemier')
      .setDescription('Explore the exciting video games created by Justin Bohemier!')
      .setURL('https://justinbohemier.wixsite.com/portfolio/game-design')
      .setColor('Random')
      .setFields(
        {
          name: 'Game Design Showcase',
          value: 'Justin Bohemier’s portfolio features innovative and engaging video games. Explore the games he has worked on and their development journey.',
          inline: false,
        },
        {
          name: 'Featured Projects',
          value: 'Check out some of the featured games and their unique mechanics, art styles, and storylines.',
          inline: false,
        },
        {
          name: 'Learn More',
          value: 'Visit the [portfolio website](https://justinbohemier.wixsite.com/portfolio/game-design) to discover more about the games and the developer\'s journey.',
          inline: false,
        }
      )
      .setImage('https://static.wixstatic.com/media/1e0275_aa58ad283e7e428a995f2b2aeda902e5~mv2.jpg/v1/fill/w_887,h_492,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/1e0275_aa58ad283e7e428a995f2b2aeda902e5~mv2.jpg')
      .setTimestamp()
      .setFooter({
        text: 'Visit Justin Bohemier’s Portfolio for more!',
      });

    // Send the embed to the channel
    await interaction.editReply({ embeds: [embed] });
  },
};
