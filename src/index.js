import dotenv from 'dotenv'                                           // Environment variables
dotenv.config()                                                       // Get environment variables
import fs from 'fs'                                                   // Filesystem
import { Client, IntentsBitField } from 'discord.js'                  // Discord
import eventHandler from './handlers/eventHandler.js'                 // Event Handler
import BotActivityCommand from './commands/moderation/botactivity.js' // Bot Activity module
import BootEvent from './events/ready/02boot.js'                      // Boot Event

let intents = []
intents.push(IntentsBitField.Flags.Guilds)
intents.push(IntentsBitField.Flags.GuildMembers)
intents.push(IntentsBitField.Flags.GuildMessages)
intents.push(IntentsBitField.Flags.GuildMessageReactions)
intents.push(IntentsBitField.Flags.MessageContent)
intents.push(IntentsBitField.Flags.DirectMessages)
intents.push(IntentsBitField.Flags.DirectMessageReactions)

const DEFAULTS = JSON.parse(fs.readFileSync("./src/dbs/defaults.json", "utf8"));

// Bail if we fail to get server profile information
if (!DEFAULTS) {
  console.log("🔴Failed to get server profile information.")
  process.exit(1)
}

const client = new Client({ intents: intents });

(async () => {
  // Create Client Object
  if (process.env.NODE_ENV === 'development') {
    // Run the development bot logic
    await client.login(process.env.TOKEN_DEV);
  } else {
    // Run the main bot logic
    await client.login(process.env.TOKEN);
  }

  // Register Events
  console.log("---")
  await eventHandler(client);

  // Set Boot Event
  // console.log("---")
  // let boot = new BootEvent()
  // await boot.execute(client)

  // // Set Bot Activity Status
  // console.log("---");
  // let ba = new BotActivityCommand({ null: true })
  // // @ts-ignore
  // await ba.execute(client, null, [], null, "")
})();
