const { RookEmbed } = require('../../classes/embed/rembed.class.js')
const shell = require('shelljs')
const fs = require('fs')

module.exports = {
  name: 'hello',
  description: 'Hello',

  execute: async (client, interaction) => {
    await interaction.deferReply()

    let props = {}

    let GLOBALS = null
    const defaults = JSON.parse(fs.readFileSync("./src/dbs/defaults.json", "utf8"))
    try {
      if (fs.existsSync("./src/PROFILE.json")) {
        GLOBALS = JSON.parse(fs.readFileSync("./src/PROFILE.json", "utf8"))
      } else {
        console.log("🟡Ready Event: PROFILE manifest not found! Using defaults!")
      }
      GLOBALS = (
        GLOBALS?.selectedprofile &&
        GLOBALS?.profiles &&
        GLOBALS.selectedprofile in GLOBALS.profiles
      ) ?
        GLOBALS.profiles[GLOBALS.selectedprofile]:
        defaults
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

    let user = client?.user

    let output = [
      "---"
    ]
    output.push(
      (user ? user.username : "") +
      ` v${PACKAGE.version} is Online!`
    )
    if (DEV) {
      let profileName = `${GLOBALS.name}-<${BRANCH}>:[${COMMIT}]`
      output.push(
        `!!! DEV MODE (${profileName}) !!!`
      )
    } else {
      let profileName = (user ? user.username : "") + `-<${BRANCH}>:[${COMMIT}]`
      output.push(
        `\*\*\* PROD MODE (${profileName}) \*\*\*`
      )
    }
    // output.push("Mongoose warning about collection.ensureIndex will be thrown.")
    output.push("Bot is Ready!")
    output.push("")

    props.title = { text: output[1], url: "https://github.com/mysterypaintwo/rookbot" }
    props.description = [
      output[2].replace(
        GLOBALS.name,
        GLOBALS?.discord?.user?.id ?
        `<@${GLOBALS.discord.user.id}>` :
        GLOBALS.name
      )
      .replace(
        /\*\*\*/g,
        "🟩"
      )
      .replace(
        /!!!/g,
        "🟧"
      )
      .replace(
        `<${BRANCH}>`,
        `[\`${BRANCH}\`](https://github.com/mysterypaintwo/rookbot/tree/${BRANCH})`
      )
      .replace(
        `[${COMMIT}]`,
        `[\`${COMMIT}\`](https://github.com/mysterypaintwo/rookbot/tree/${COMMIT})`
      ),
      user ? output[4].replace(
        "Bot",
        `<@${user.id}>`
      ) : output[4]
    ].join("\n")

    console.log(output.join("\n"))

    if (client?.guilds) {
      for (let [ guildID, guildData ] of client.guilds.cache) {
        let clientMember = null
        if(user) {
          clientMember = await guildData.members.fetch(user.id)
        }

        if (clientMember) {
          let nick = clientMember?.nickname || clientMember.user.username
          let prefix = client?.options?.defaultPrefix ||
            client?.options?.prefix ||
            client?.prefix ||
            "/ "
          if (!(nick.includes(`[${prefix.trim()}] `))) {
            let regexp = /^[\[\(\{]([\S]+)[\}\)\]] /
            if (nick.match(regexp)) {
              nick = nick.replace(regexp,`[${prefix.trim()}] `)
            } else {
              nick = `[${prefix.trim()}] ${nick}`
            }
          }
          if (nick != (clientMember?.nickname || clientMember.user.username)) {
            clientMember.setNickname(nick)
          }
        }
      }
    }

    const embed = new RookEmbed(props)

    await interaction.editReply({ embeds: [ embed ] })
  }
}
