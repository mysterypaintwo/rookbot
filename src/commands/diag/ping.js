//@ts-check

import RookCommand from '../../classes/command/rcommand.class.js'

let command = class PingCommand extends RookCommand {
  constructor() {
    let comprops = {
      name: "ping",
      category: "diagnostic",
      description: "This is a ping command"
    }
    let props = {
      title: { text: "Pong!" },
      image: "https://i.pinimg.com/originals/c8/8c/2f/c88c2fa6b66b89717ddeaafaf8c4d264.gif"
    }
    super(
      {...comprops},
      {...props}
    )
  }

  async test(client, message, args) {
    this.execute(client, message, args, null, "")
  }
}

export default command
