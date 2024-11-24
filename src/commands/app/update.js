const { PermissionFlagsBits } = require('discord.js');
const { RookEmbed } = require('../../classes/embed/rembed.class.js')
const shell = require('shelljs')
const fs = require('fs')

module.exports = {
  name: 'update',
  description: 'Update',

  execute: async (client, interaction) => {
    await interaction.deferReply()

    let GLOBALS = null
    const defaults = JSON.parse(fs.readFileSync("./src/dbs/defaults.json", "utf8"))
    let profileName = "default"
    try {
      if (fs.existsSync("./src/PROFILE.json")) {
        GLOBALS = JSON.parse(fs.readFileSync("./src/PROFILE.json", "utf8"))
      } else {
        console.log("🟡Ready Event: PROFILE manifest not found! Using defaults!")
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
      console.log("🔴Ready Event: PROFILE manifest not found!")
      process.exit(1)
    }

    let PACKAGE = JSON.parse(fs.readFileSync("./package.json","utf8"))
    let BRANCH = ""
    let COMMITS = {
      current: "",
      latest: "",
      new: ""
    }
    try {
      if (fs.existsSync("./.git/HEAD")) {
        // @ts-ignore
        BRANCH = fs.readFileSync("./.git/HEAD","utf8").trim().match(/(?:\/)([^\/]*)$/)
        if (BRANCH && (BRANCH.length > 0)) {
          // @ts-ignore
          BRANCH = BRANCH[1]
        }
      } else if (process.env?.HOME == "/app") {
        BRANCH = "heroku"
      }
    } catch (err) {
      console.log(err)
    }

    // Get Current commit ID
    try {
      let git_log = shell.exec(
        "git log -1",
        { silent: true }
      )
      git_log = git_log.stdout.trim()
      let commits = git_log.split("\n")
      let latest_commit = commits[0 * 6]
      COMMITS.current = latest_commit.match(/^(?:[^\s]+)(?:[\s])([^\s]{7})/)
      if (COMMITS.current && (COMMITS.current.length > 0)) {
        COMMITS.current = COMMITS.current[1]
      }
    } catch (err) {
      console.log(err.stack)
    }

    // Pull
    try {
      shell.exec(
        "git pull",
        { silent: true }
      )
    } catch(err) {
      console.log(err.stack)
    }

    // Get Fresh commit ID
    // Get previous commit ID
    try {
      let git_log = shell.exec(
        "git log -2",
        { silent: true }
      )
      git_log = git_log.stdout.trim()
      let commits = git_log.split("\n")
      let latest_commit = commits[0 * 6]
      COMMITS.fresh = latest_commit.match(/^(?:[^\s]+)(?:[\s])([^\s]{7})/)
      if (COMMITS.fresh && (COMMITS.fresh.length > 0)) {
        COMMITS.fresh = COMMITS.fresh[1]
      }
      let second_commit = commits[1 * 6]
      COMMITS.prev = second_commit.match(/^(?:[^\s]+)(?:[\s])([^\s]{7})/)
      if (COMMITS.prev && (COMMITS.prev.length > 0)) {
        COMMITS.prev = COMMITS.prev[1]
      }
    } catch (err) {
      console.log(err.stack)
    }

    let props = {}
    let user = client?.user

    let console_output = [
      "---"
    ]

    console_output.push(
      "Updating " +
      (user ? user.username : "") +
      ` v${PACKAGE.version}!`
    )
    props = {
      title: {
        text: "🔼 " + console_output[1],
        url: "https://github.com/mysterypaintwo/rookbot"
      }
    }

    console_output.push(
      `Branch Key:      <${BRANCH}>`,
      `Current Commit:  [${COMMITS.current}]`,
      `Fresh Commit:    [${COMMITS.fresh}]`,
      `Previous Commit: [${COMMITS.prev}]`,
      ""
    )

    // console.log(console_output)

    /*

    console_output[1] = ---
    console_output[2] = MODE
    console_output[3] = Footer  Tag
    console_outout[4] = Profile Key
    console_output[5] = Branch  Key
    console_output[6] = Commit  ID
    console_output[7] = Ready

    */
    props.fields = [
      {
        name: "Branch",
        value:
          console_output[2].substring(console_output[2].indexOf(':') + 2)
          .replace(
            `<${BRANCH}>`,
            `[\`${BRANCH}\`](https://github.com/mysterypaintwo/rookbot/tree/${BRANCH})`
          ),
      }
    ]

    props.fields.push(
      {
        name: "Old Commit",
        value: `[\`${COMMITS.current}\`](https://github.com/mysterypaintwo/rookbot/tree/${COMMITS.current})`,
        inline: true
      }
    )

    // If fresh isn't the same as the old current
    if (COMMITS.fresh != COMMITS.current) {
      props.fields.push(
        {
          name: "New Commit",
          value: `[\`${COMMITS.fresh}\`](https://github.com/mysterypaintwo/rookbot/tree/${COMMITS.fresh})`,
          inline: true
        }
      )
      props.fields.push(
        {
          name: "Updated?",
          value: "Yes"
        }
      )
    } else {
      props.fields[1].name = "Same Commit"
      props.fields.push(
        {
          name: "Updated?",
          value: "No"
        }
      )
    }

    const embed = new RookEmbed(props)

    await interaction.editReply({ embeds: [ embed ] })
  },
  permissionsRequired: [PermissionFlagsBits.Administrator], // Restrict to staff
  botPermissions: [PermissionFlagsBits.Administrator] // Ensure bot can send messages
}
