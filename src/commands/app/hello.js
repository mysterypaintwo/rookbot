const { RookCommand } = require('../../classes/command/rcommand.class')
const timeFormat = require('../../utils/timeFormat.js')
const colors = require('../../dbs/colors.json')
const shell = require('shelljs')
const fs = require('fs')

/**
 * @class
 * @classdesc Instance Hello
 * @this {HelloCommand}
 * @extends {RookCommand}
 * @public
 */
module.exports = class HelloCommand extends RookCommand {
  constructor(client) {
    let comprops = {
      name: "hello",
      category: "app",
      description: "Hello",
      flags: {
        test: "basic"
      }
    }
    let props = {
      caption: { text: "Hello World" },
      title: {
        emoji:  "🔼",
        text:   "Hello World"
      },
      color:  colors["success"]
    }
    super(
      client,
      {...comprops},
      {...props}
    )
  }

  async action(client) {
    let BRANCH = ""
    let COMMIT = ""

    // Get Branch
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

    // Get Commit
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

    let user = client?.user

    let console_output = [
      "---"
    ]

    console_output.push(
      (user ? user.username : "") +
      ` v${this.profile.PACKAGE.version} is Online!`
    )
    this.props.title.text = console_output[1]
    this.props.title.url  = "https://github.com/mysterypaintwo/rookbot"

    if (this.DEV) {
      this.props.color = "#FFAF00"
      console_output.push(
        `!!! DEV MODE !!!`,
        `Footer Tag:  "${this.profile.name}"`
      )
    } else {
      this.props.color = "#00AF00"
      console_output.push(
        `\*\*\* PROD MODE \*\*\*`,
        `Footer Tag:  "` + (user ? user.username : "") + '"'
      )
    }
    console_output.push(
      `Profile Key: '${this.profile.profileName}'`,
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
    this.props.description =
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
      name: client.guild.name || this?.channel?.guild.name,
      id: client.guild.id || this?.channel?.guild.id
    }
    let uptime = client.uptime
    let launchedAt = new Date() - uptime
    this.props.fields = [
      [
        {
          name: "Name",
          value:
            console_output[3].substring(console_output[3].indexOf(':') + 2)
              .replace(
                this.profile.name,
                this.profile?.discord?.user?.id ?
                `<@${this.profile.discord.user.id}>` :
                this.profile.name
              )
        },
        {
          name: "Profile",
          value:
            console_output[4].substring(console_output[4].indexOf(':') + 2)
              .replace(
                `'${this.profile.profileName}'`,
                `\`${this.profile.profileName}\``
              )
        }
      ],
      [
        {
          name: "Server Name",
          value: server?.name || "?"
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
          value: timeFormat(launchedAt)
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

    return !this.error
  }
}
