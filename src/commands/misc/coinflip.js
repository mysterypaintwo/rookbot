const { RookEmbed } = require("../../classes/embed/rembed.class");

module.exports = {
    name: 'coinflip',
    description: 'Flips a coin and returns either Heads or Tails',

    execute: async (client, interaction) => {
        // Randomly choose between "Heads" and "Tails"
        const outcome = Math.random() < 0.5 ? 'Heads' : 'Tails';

        let players = {}
        players["bot"] = {
          name: client.user.displayName,
          avatar: client.user.avatarURL()
        }
        players["user"] = {
          name: interaction.user.displayName,
          avatar: interaction.user.avatarURL(),
          username: interaction.user.username
        }
        let props = {
          title: {
            text: "Flip a coin!"
          },
          description: `The coin landed on **${outcome}**!`,
          players: players
        }
        const embed = new RookEmbed(props)

        // Respond with the outcome
        await interaction.reply({ embeds: [ embed ] });
    }
  };
