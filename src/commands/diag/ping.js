const { RookCommand } = require('../../classes/command/rcommand.class')

module.exports = class PingCommand extends RookCommand {
  constructor() {
    let comprops = {
      name: "ping",
      category: "diagnostic",
      description: "Pong!"
    }
    let props = {
      title: { text: "Pong!" }
    }
    super(
      {...comprops},
      {...props}
    )
  }

  async action(client, interaction, cmd) {
    await interaction.deferReply();

    const reply = await interaction.fetchReply();

    const ping = reply.createdTimestamp - interaction.createdTimestamp;

    // Entities
    let entities = {
      bot: { name: client.user.name, avatar: client.user.avatarURL(), username: client.user.username },
      user: { name: interaction.user.displayName, avatar: interaction.user.avatarURL(), username: interaction.user.username }
    }
    // Players
    this.props.players = {
      user: entities.bot,
      target: entities.user
    }

    this.props.fields = [
      {
        name: "Client",
        value: `${ping}ms`
      },
      {
        name: "Websocket",
        value: `${client.ws.ping}ms`
      }
    ]

    await interaction.deleteReply();
  }

  async test(client, message, args) {
    this.execute(client, message, args, null, "")
  }
};
