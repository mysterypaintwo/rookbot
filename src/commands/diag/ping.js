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
      image: "https://thumbs.gfycat.com/VariableNervousAfricancivet-small.gif"
    }
    super(
      {...comprops},
      {...props}
    )
  }

  async test(client, message, args) {
    this.run(client, message, args, null, "")
  }
}

export default command
