const { RookCommand } = require('../../classes/command/rcommand.class');

module.exports = class EmbedCommand extends RookCommand {
  constructor() {
    let comprops = {
      name: "embed",
      description: "Sends an embed with predefined content"
    }
    let props = {
      title: {
        text: "Embed Title",
        url: "https://justinbohemier.wixsite.com/portfolio/game-design"
      },
      description: "This is an embed description",
      color: "Random",
      fields: [
        {
          name: "Field title",
          value: "Some random value",
          inline: true
        },
        {
          name: "2nd Field title",
          value: "Some random value",
          inline: true
        },
        {
          name: "3rd Field title",
          value: "Some random value",
          inline: true
        }
      ],
      image: "https://pbs.twimg.com/media/GcPyiUlasAEEtPJ?format=jpg&name=900x900",
      footer: {
        msg: "Footer text",
        image: "https://pbs.twimg.com/media/GcPyiUlasAEEtPJ?format=jpg&name=900x900"
      }
    }

    super(
      {...comprops},
      {...props}
    )
  }

  /**
   * Sends an embed message in response to a slash command interaction.
   * @param {Client} client
   * @param {Interaction} interaction
   */
  async action(client, interaction) {
    // Acknowledge the interaction immediately without sending a reply yet
    await interaction.deferReply(); // This avoids the bot "waiting for a response"

    // all done in constructor

    await interaction.deleteReply();
  }
};
