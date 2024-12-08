const { RookCommand } = require('../../classes/command/rcommand.class')
const colors = require('../../dbs/colors.json')
const shell = require('shelljs')
const fs = require('fs')

module.exports = class HelloCommand extends RookCommand {
  constructor() {
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
      {...comprops},
      {...props}
    )
  }

  async action(client, interaction, cmd, options) {
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
      ` v${this.PACKAGE.version} is Online!`
    )
    this.props.title.text = console_output[1]
    this.props.title.url  = "https://github.com/mysterypaintwo/rookbot"

    if (this.DEV) {
      console_output.push(
        `!!! DEV MODE !!!`,
        `Footer Tag:  "${this.GLOBALS.name}"`
      )
    } else {
      console_output.push(
        `\*\*\* PROD MODE \*\*\*`,
        `Footer Tag:  "` + (user ? user.username : "") + '"'
      )
    }
    console_output.push(
      `Profile Key: '${this.PACKAGE.profileName}'`,
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
      name: await interaction?.guild.name || this?.channel?.guild.name,
      id: await interaction?.guild.id || this?.channel?.guild.id
    }
    let uptime = client.uptime
    let launched = Math.floor((new Date() - uptime) / 1000)
    this.props.fields = [
      {
        name: "Name",
        value:
          console_output[3].substring(console_output[3].indexOf(':') + 2)
          .replace(
            this.GLOBALS.name,
            this.GLOBALS?.discord?.user?.id ?
            `<@${this.GLOBALS.discord.user.id}>` :
            this.GLOBALS.name
          ),
        inline: true
      },
      {
        name: "Profile",
        value:
          console_output[4].substring(console_output[4].indexOf(':') + 2)
          .replace(
            `'${this.PACKAGE.profileName}'`,
            `\`${this.PACKAGE.profileName}\``
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
        value: `\`${server.id}\``,
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
        name: "Launched",
        value: `<t:${launched}:f> (\`${launched}\`)`
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

    return !this.error
  }
}
