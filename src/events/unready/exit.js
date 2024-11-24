const { RookEmbed } = require('../../classes/embed/rembed.class.js')
const shell = require('shelljs')
const fs = require('fs')

module.exports = async (client) => {
  let profileName = "default"
  let defaults = {}
  try {
    /**
     * Profile properties
     * @type {Object.<string, any>}
     */
    defaults = JSON.parse(fs.readFileSync("./src/dbs/defaults.json", "utf8"))
  } catch(err) {
    console.log("🔴Exit Sequence: DEFAULTS manifest not found!")
    process.exit(1)
  }

  let GLOBALS = {}
  try {
    /**
     * Global properties
     * @type {Object.<string, any>}
     */
    if (fs.existsSync("./src/PROFILE.json")) {
      GLOBALS = JSON.parse(fs.readFileSync("./src/PROFILE.json", "utf8"))
    } else {
      console.log("🟡Exit Sequence: PROFILE manifest not found! Using defaults!")
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
    console.log("🔴Exit Sequence: PROFILE manifest not found!")
    process.exit(1)
  }

  let PACKAGE = {}
  try {
    /**
     * Package properties
     * @type {Object.<string, any>}
     */
    PACKAGE = JSON.parse(fs.readFileSync("./package.json","utf8"))
  } catch(err) {
    console.log("🔴Exit Sequence: PACKAGE manifest not found!")
    process.exit(1)
  }

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
    ` v${PACKAGE.version} is Offline!`
  )
  props = {
    title: {
      text: "🔽 " + console_output[1],
      url: "https://github.com/mysterypaintwo/rookbot"
    }
  }

  if (DEV) {
    console_output.push(
      `vvv DEV MODE vvv`,
      `Footer Tag:  "${GLOBALS.name}"`
    )
  } else {
    console_output.push(
      `vvv PROD MODE vvv`,
      `Footer Tag:  "` + (user ? user.username : "") + '"'
    )
  }
  console_output.push(
    `Profile Key: '${profileName}'`,
    `Branch Key:  <${BRANCH}>`,
    `Commit ID:   [${COMMIT}]`,
    "Bot is Unready!",
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
      /vvv/g,
      "🟥"
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

  console.log(console_output.join("\n"))

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

      let channelIDs = require(`../../dbs/${GLOBALS['targetserver']}/channels.json`);
      let channelID = channelIDs["bot-console"];
      let guild = await client.guilds.cache.find(g => g.id === GLOBALS["targetserver"]);
      let channel = await guild.channels.cache.find(c => c.id === channelID);
      let embed = new RookEmbed(props)
      await channel.send({ embeds: [ embed ] })
    }
  }
}
