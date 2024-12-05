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
    setTimeout(() => {
      let exit_cmd = new ExitCommand()
      exit_cmd.execute(client)
    })
  }
})()
