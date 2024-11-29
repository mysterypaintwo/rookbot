const { PermissionFlagsBits } = require('discord.js');
const { RookEmbed } = require('../../classes/embed/rembed.class.js')
const shell = require('shelljs')
const fs = require('fs')

module.exports = {
  name: 'install',
  description: 'Install Node Modules',

  execute: async (client, interaction) => {
    await interaction.deferReply()

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

    let PACKAGE = JSON.parse(fs.readFileSync("./package.json","utf8"))

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

    let props = {}
    let user = client?.user

    let console_output = [
      "---"
    ]

    console_output.push(
      "Installing " +
      (user ? user.username : "") +
      ` v${PACKAGE.version}!`
    )
    props = {
      title: {
        text: "💿 " + console_output[1],
        url: "https://github.com/mysterypaintwo/rookbot"
      }
    }

    // console.log(console_output)

    /*

    console_output[1] = ---
    console_output[2] = Installing Message
    console_output[3] = Output from npm i

    */

    console_output.push(node_install)
    props.description = console_output

    const embed = new RookEmbed(props)

    await interaction.editReply({ embeds: [ embed ] })
  },
  permissionsRequired: [PermissionFlagsBits.Administrator], // Restrict to staff
  botPermissions: [PermissionFlagsBits.Administrator] // Ensure bot can send messages
}
