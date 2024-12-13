const { BotDevCommand } = require('../../classes/command/botdevcommand.class.js')
const shell = require('shelljs')
const fs = require('fs')

/**
 * @class
 * @classdesc NPM Install
 * @this {InstallCommand}
 * @extends {BotDevCommand}
 * @public
 */
module.exports = class InstallCommand extends BotDevCommand {
  constructor(client) {
    let comprops = {
      name: "install",
      category: "app",
      description: "Install Node Modules",
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

  async action(client, interaction, cmd, options) {
    let GLOBALS = null
    const defaults = JSON.parse(fs.readFileSync("./src/dbs/defaults.json", "utf8"))
    let profileName = "default"
    try {
      if (fs.existsSync("./src/PROFILE.json")) {
        GLOBALS = JSON.parse(fs.readFileSync("./src/PROFILE.json", "utf8"))
      } else {
        console.log("🟡Install Script: PROFILE manifest not found! Using defaults!")
      }
      if (
        GLOBALS?.selectedprofile &&
        GLOBALS?.profiles &&
        GLOBALS.selectedprofile in GLOBALS.profiles
      ) {
        profileName = GLOBALS.selectedprofile
        GLOBALS = GLOBALS.profiles[GLOBALS.selectedprofile]
      } else {
        GLOBALS = defaults
      }
    } catch(err) {
      console.log("🔴Install Script: PROFILE manifest not found!")
      process.exit(1)
    }

    let node_install = null
    try {
      node_install = shell.exec(
        "npm i",
        { silent: true }
      )
      node_install = node_install.stdout.trim()
    } catch (err) {
      console.log(err.stack)
    }

    let user = client?.user

    let console_output = [
      "---"
    ]

    console_output.push(
      "Installing " +
      (user ? user.username : "") +
      ` v${this.PACKAGE.version}!`
    )
    this.props.title = {
      text: "💿 " + console_output[1],
      url: "https://github.com/mysterypaintwo/rookbot"
    }

    // console.log(console_output)

    /*

    console_output[1] = ---
    console_output[2] = Installing Message
    console_output[3] = Output from npm i

    */

    console_output.push(`
      \`\`\`` + "\n" +
      node_install +
      `\`\`\`
    `)
    this.props.description = console_output

    return !this.error
  }
}
