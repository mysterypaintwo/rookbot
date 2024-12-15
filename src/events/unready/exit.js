const { RookEmbed } = require('../../classes/embed/rembed.class.js')
const shell = require('shelljs')
const fs = require('fs')

module.exports = async (client, interaction) => {
  let GLOBALS = client.profile

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

  let DEV = process.env.ENV_ACTIVE === "development"

  let props = {}
  let user = client?.user

  let console_output = [
    "---"
  ]

  console_output.push(
    (user ? user.username : "") +
    ` v${GLOBALS?.PACKAGE?.version} is Offline!`
  )
  props = {
    title: {
      text: "🔽 " + console_output[1],
      url: "https://github.com/mysterypaintwo/rookbot"
    }
  }

  if (DEV) {
    props.color = "#AF0000"
    console_output.push(
      `vvv DEV MODE vvv`,
      `Footer Tag:  "${GLOBALS.name}"`
    )
  } else {
    props.color = "#AF0000"
    console_output.push(
      `vvv PROD MODE vvv`,
      `Footer Tag:  "` + (user ? user.username : "") + '"'
    )
  }
  console_output.push(
    `Profile Key: '${GLOBALS.profileName}'`,
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
    name: await interaction?.guild?.name || "Unknown Guild",
    id: await interaction?.guild?.id || process.env.GUILD_ID
  }
  if (server?.id) {
    server.name = client?.guilds.cache.find(
      g => g.id === server.id
    )?.name || "Unknown Guild"
  }

  let uptime = client.uptime
  let launched = Math.floor((new Date() - uptime) / 1000)
  let offline = Math.floor(new Date() / 1000)
  props.fields = [
    [
      {
        name: "Name",
        value:
          console_output[3].substring(console_output[3].indexOf(':') + 2)
            .replace(
              GLOBALS.name,
              GLOBALS?.discord?.user?.id ?
              `<@${GLOBALS.discord.user.id}>` :
              GLOBALS.name
            )
      },
      {
        name: "Profile",
        value:
          console_output[4].substring(console_output[4].indexOf(':') + 2)
            .replace(
              `'${GLOBALS.profileName}'`,
              `\`${GLOBALS.profileName}\``
            )
      }
    ],
    [
      {
        name: "Server Name",
        value: server?.name ? server.name : "?"
      },
      {
        name: "Server ID",
        value: `\`${server.id}\``
      }
    ],
    [
      {
        name: "Branch",
        value:
          console_output[5].substring(console_output[5].indexOf(':') + 2)
            .replace(
              `<${BRANCH}>`,
              `[\`${BRANCH}\`](https://github.com/mysterypaintwo/rookbot/tree/${BRANCH})`
            )
      },
      {
        name: "Commit",
        value:
          console_output[6].substring(console_output[6].indexOf(':') + 2)
            .replace(
              `[${COMMIT}]`,
              `[\`${COMMIT}\`](https://github.com/mysterypaintwo/rookbot/tree/${COMMIT})`
            )
      }
    ],
    [
      {
        name: "Launched",
        value: `<t:${launched}:f> (\`${launched}\`)`
      }
    ],
    [
      {
        name: "Exited",
        value: `<t:${offline}:f> (\`${offline}\`)`
      }
    ],
    [
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

      let guildID = interaction?.guild?.id || process.env.GUILD_ID
      let channelIDs = require(`../../dbs/${guildID}/channels.json`)
      let channelID = channelIDs["bot-console"]
      let guild = await client.guilds.cache.find(
        g => g.id === guildID
      )
      let channel = await guild?.channels.cache.find(
        c => c.id === channelID
      ) || interaction.channel
      let embed = await new RookEmbed(client, props)
      await channel.send(
        {
          embeds: [ embed ]
        }
      )
    }
  }
}
