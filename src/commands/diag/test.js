const { RookCommand } = require('../../classes/command/rcommand.class')

module.exports = class TestCommand extends RookCommand {
  constructor() {
    let comprops = {
      name: "test",
      category: "diagnostic",
      flags: {
        test: "basic"
      }
    }
    super(
      {...comprops}
    )
  }

  async action(client, interaction, cmd, options) {
    if (! this.DEV) {
      // Do the thing
      this.props.description = "Doing the thing!"
    } else {
      // Describe the thing
      this.props.description = "Describing the thing!"
    }
  }

  async test(client, interaction, args) {
    await this.execute(client, interaction, args)
  }
}
