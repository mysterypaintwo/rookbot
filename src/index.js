require('@dotenvx/dotenvx').config()
const { Client, IntentsBitField } = require('discord.js')
const eventHandler = require('./handlers/eventHandler')
const rook_exit = require('./events/unready/exit')

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
    setTimeout(rook_exit, 60 * 1000)
  }
})()
