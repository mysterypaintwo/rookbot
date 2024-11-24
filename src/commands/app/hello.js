const { RookEmbed } = require('../../classes/embed/rembed.class.js')
const shell = require('shelljs')
const fs = require('fs')

module.exports = {
  name: 'hello',
  description: 'Hello',

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
    let COMMIT = ""
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

    try {
      let git_log = shell.exec(
        "git log -1",
        { silent: true }
      )
      git_log = git_log.stdout.trim()
      let latest_commit = git_log.split("\n")[0]
      COMMIT = latest_commit.match(/^(?:[^\s]+)(?:[\s])([^\s]{7})/)
      if (COMMIT && (COMMIT.length > 0)) {
        COMMIT = COMMIT[1]
      }
    } catch (err) {
      console.log(err)
    }

    let DEV = GLOBALS.DEV

    let props = {}
    let user = client?.user

    let console_output = [
      "---"
    ]

    console_output.push(
      (user ? user.username : "") +
      ` v${PACKAGE.version} is Online!`
    )
    props = {
      title: {
        text: "🔼 " + console_output[1],
        url: "https://github.com/mysterypaintwo/rookbot"
      }
    }

    if (DEV) {
      console_output.push(
        `!!! DEV MODE !!!`,
        `Footer Tag:  "${GLOBALS.name}"`
      )
    } else {
      console_output.push(
        `\*\*\* PROD MODE \*\*\*`,
        `Footer Tag:  "` + (user ? user.username : "") + '"'
      )
    }
    console_output.push(
      `Profile Key: '${profileName}'`,
      `Branch Key:  <${BRANCH}>`,
      `Commit ID:   [${COMMIT}]`,
      "Bot is Ready!",
      ""
    )
    /*

    console_output[1] = ---
    console_output[2] = MODE
    console_output[3] = Footer  Tag
    console_outout[4] = Profile Key
    console_output[5] = Branch  Key
    console_output[6] = Commit  ID
    console_output[7] = Ready

    */
    props.description =
      console_output[2]
      .replace(
        /\*\*\*/g,
        "🟩"
      )
      .replace(
        /!!!/g,
        "🟧"
      )
    let server = {
      id: GLOBALS?.targetserver ? GLOBALS.targetserver : "?"
    }
    if (server.id != "?") {
      server.name = await client.guilds.cache.find(g => g.id == server.id).name
    }
    props.fields = [
      {
        name: "Name",
        value:
          console_output[3].substring(console_output[3].indexOf(':') + 2)
          .replace(
            GLOBALS.name,
            GLOBALS?.discord?.user?.id ?
            `<@${GLOBALS.discord.user.id}>` :
            GLOBALS.name
          ),
        inline: true
      },
      {
        name: "Profile",
        value:
          console_output[4].substring(console_output[4].indexOf(':') + 2)
          .replace(
            `'${profileName}'`,
            `\`${profileName}\``
          ),
        inline: true
      },
      {
        name: " ",
        value: " ",
        inline: true
      },
      {
        name: "Server Name",
        value: server?.name ? server.name : "?",
        inline: true
      },
      {
        name: "Server ID",
        value: server.id,
        inline: true
      },
      {
        name: " ",
        value: " ",
        inline: true
      },
      {
        name: "Branch",
        value:
          console_output[5].substring(console_output[5].indexOf(':') + 2)
          .replace(
            `<${BRANCH}>`,
            `[\`${BRANCH}\`](https://github.com/mysterypaintwo/rookbot/tree/${BRANCH})`
          ),
        inline: true
      },
      {
        name: "Commit",
        value:
          console_output[6].substring(console_output[6].indexOf(':') + 2)
          .replace(
            `[${COMMIT}]`,
            `[\`${COMMIT}\`](https://github.com/mysterypaintwo/rookbot/tree/${COMMIT})`
          ),
        inline: true
      },
      {
        name: " ",
        value: " ",
        inline: true
      },
      {
        name: "Status",
        value:
          user ?
            console_output[7]
            .replace(
              "Bot",
              `<@${user.id}>`
            ) :
            console_output[7]
      }
    ]

    const embed = new RookEmbed(props)

    await interaction.editReply({ embeds: [ embed ] })
  }
}
