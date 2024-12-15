const { BotDevCommand } = require('../../classes/command/botdevcommand.class.js')
const shell = require('shelljs')
const fs = require('fs')

module.exports = class UpdateCommand extends BotDevCommand {
  constructor(client) {
    let comprops = {
      name: "update",
      category: "app",
      description: "Update Node Modules",
      flags: {
        test: "basic"
      }
      // permissionsRequired: [PermissionFlagsBits.Administrator], // Restrict to staff
      // botPermissions: [PermissionFlagsBits.Administrator] // Ensure bot can send messages
    }
    let props = {}

    super(
      client,
      {...comprops},
      {...props}
    )
  }

  async action(client) {
    let node_update = null
    try {
      node_update = shell.exec("npm run-script update")
      node_update = node_update.stdout.trim()
    } catch (err) {
      console.log(err.stack)
    }

    let user = client?.user

    let console_output = [
      "---"
    ]

    console_output.push(
      "Updating " +
      (user ? user.username : "") +
      ` v${this.profile.PACKAGE.version}!`
    )
    this.props.title = {
      text: "💿 " + console_output[1],
      url: "https://github.com/mysterypaintwo/rookbot"
    }

    // console.log(console_output)

    /*

    console_output[1] = ---
    console_output[2] = Updating Message
    console_output[3] = Output from npm up

    */

    console_output.push(`
      \`\`\`` + "\n" +
      node_update +
      `\`\`\`
    `)
    this.props.description = console_output

    return !this.error
  }
}
