const { RookCommand } = require('../../classes/command/rcommand.class')

module.exports = class TestCommand extends RookCommand {
  constructor(client) {
    let comprops = {
      name: "test",
      category: "diagnostic",
      flags: {
        test: "basic"
      }
    }
    super(
      client,
      {...comprops}
    )
  }

  async action(client, interaction, options) {
    if (! this.DEV) {
      // Do the thing
      this.props.description = "Doing the thing!"
    } else {
      // Describe the thing
      this.props.description = "Describing the thing!"
    }

    return !this.error
  }
}
