const { RookCommand } = require('../../classes/command/rcommand.class')

module.exports = class PingCommand extends RookCommand {
  constructor() {
    let comprops = {
      name: "ping2",
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

  async execute(client, message, args, util, cmd) {
    const reply = await interaction.fetchReply();

    const ping = reply.createdTimestamp - interaction.createdTimestamp;

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
        text: "Pong!"
      },
      description: `Client: ${ping}ms | Websocket: ${client.ws.ping}ms`,
      players: players
      // image: "https://i.pinimg.com/originals/c8/8c/2f/c88c2fa6b66b89717ddeaafaf8c4d264.gif"
    }

    const embed = new RookEmbed(props)

    await interaction.editReply({ embeds: [ embed ] });
  }

  async test(client, message, args) {
    this.execute(client, message, args, null, "")
  }
};
