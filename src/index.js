require('@dotenvx/dotenvx').config()
const { Client, IntentsBitField } = require('discord.js')
const { ExitCommand } = require('./commands/app/exit')
const eventHandler = require('./handlers/eventHandler')

const client = new Client(
  {
    intents: [
      IntentsBitField.Flags.Guilds,
      IntentsBitField.Flags.GuildMembers,
      IntentsBitField.Flags.GuildMessages,
      IntentsBitField.Flags.MessageContent
    ]
  }
);

(async () => {
  // Create Client Object
  await client.login(process.env.TOKEN)

  // Register Events
  console.log("---")
  await eventHandler(client)

  if (process.env.GITHUB_WORKFLOW) {
    console.log(process.env.GITHUB_WORKFLOW)
    setTimeout(async () => {
      const getLocalCommands = require('./utils/getLocalCommands')
      const localCommands = getLocalCommands()
      try {
        let commandName = "exit"
        const commandObject = localCommands.find(
          (cmd) => cmd.name === commandName
        )
        if (commandObject) {
          await commandObject.execute(
            client,
            {
              member: { user: { tag: "gitrook" } },
              user: {
                name: "gitrook",
                avatarURL: () => { return "https://cdn.discordapp.com/avatars/1313777189187223603/4bc7c1dc2b41b0bd7f77945bcc55feef.webp?size=128" },
                username: "gitrook"
              },
              reply: (props) => { console.log(props) }
            }
          );
        } else {
          console.log(localCommands)
        }
      } catch(err) {
        console.log(err.stack)
      }
    })
  }
})()
