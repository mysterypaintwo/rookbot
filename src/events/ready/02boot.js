//@ts-check

import RookEmbed from '../../classes/embed/rembed.class.js'
import RookEvent from '../../classes/event/revent.class.js'
import RookCommand from '../../classes/command/rcommand.class.js'
import fs from 'fs'

let event = class BootEvent extends RookEvent {
  constructor() {
    super('ready')
  }

  async run(handler) {
    let GLOBALS = null
    const defaults = JSON.parse(fs.readFileSync("./src/dbs/defaults.json", "utf8"))
    try {
      if (fs.existsSync("./src/PROFILE.json")) {
        GLOBALS = JSON.parse(fs.readFileSync("./src/PROFILE.json", "utf8"))
      } else {
        console.log("🟡Ready Event: PROFILE manifest not found! Using defaults!")
      }
      GLOBALS = (
        GLOBALS?.profile &&
        GLOBALS?.profiles &&
        GLOBALS.profile in GLOBALS.profiles
      ) ?
        GLOBALS.profiles[GLOBALS.profile]:
        defaults
    } catch(err) {
      console.log("🔴Ready Event: PROFILE manifest not found!")
      process.exit(1)
    }
    let PACKAGE = JSON.parse(fs.readFileSync("./package.json","utf8"))
    let BRANCH = ""
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

    let DEV = GLOBALS.DEV

    let props = {}

    let output = [
      "---",
      `${handler.client.user.username} v${PACKAGE.version} is Online!`
    ]
    if (DEV) {
      let profileName = `${GLOBALS.name}-<${BRANCH}>`
      output.push(
        `!!! DEV MODE (${profileName}) ENABLED !!!`
      )
    } else {
      let profileName = `${handler.client.user.username}-<${BRANCH}>`
      output.push(
        `\*\*\* PRODUCTION MODE (${profileName}) ENABLED \*\*\*`
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
      .replace(/\*/g, "🟩")
      .replace(/!/g, "🟧")
      .replace(`<${BRANCH}>`,`\`${BRANCH}\``),
      output[4].replace(
        "Bot",
        `<@${handler.client.user.id}>`
      )
    ].join("\n")

    console.log(output.join("\n"))

    let embed = null
    for (let [ guildID, guildData ] of handler.client.guilds.cache) {
      let clientMember = await guildData.members.fetch(handler.client.user.id)

      if (clientMember) {
        let nick = clientMember?.nickname || clientMember.user.username
        let prefix = handler.client?.options?.defaultPrefix ||
          handler.client?.options?.prefix ||
          handler.client?.prefix ||
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
      let dummyMsg = { "guild": guildData }
      const channel = await this.getChannel(dummyMsg, "bot-console")
      if (channel) {
        dummyMsg.channel = channel
        embed = new RookEmbed(props)
        let rCommand = new RookCommand({ name: "botready"}, { channel: channel })

        if (
          (!(DEV)) ||
          guildID == "185220229931073538" || // Trident Esports PRIVATE
          guildID == "745409743593406634" || // TridentBot
          false
        ) {
          let message = rCommand.send(dummyMsg, embed)
        }
      }
    }
  }
}

export default event
