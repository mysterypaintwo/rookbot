const { EmbedBuilder } = require('discord.js')
const fs = require('fs')

module.exports = async (client) => {
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
  let user = client?.user

  let output = [
    "---"
  ]
  output.push(
    (user ? user.username : "") +
    ` v${PACKAGE.version} is Online!`
  )
  if (DEV) {
    let profileName = `${GLOBALS.name}-<${BRANCH}>`
    output.push(
      `!!! DEV MODE (${profileName}) ENABLED !!!`
    )
  } else {
    let profileName = (user ? user.username : "") + `-<${BRANCH}>`
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

      let channelIDs = require(`../../dbs/${GLOBALS['testserver']}/channels.json`);
      let channelID = channelIDs["bot-console"];
      let guild = await client.guilds.cache.find(g => g.id === GLOBALS["testserver"]);
      let channel = await guild.channels.cache.find(c => c.id === channelID);

      let embed = new EmbedBuilder()
        .setTitle(props.title.text)
        .setURL(props.title.url)
        .setDescription(props.description)

      if (channel) {
        channel.send({ embeds: [ embed ] })
      }
    }
  }
}
