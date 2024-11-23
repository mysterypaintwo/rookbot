require('dotenv').config();
const { Client, IntentsBitField } = require('discord.js');
const fs = require('fs');
const eventHandler = require('./handlers/eventHandler');

const DEFAULTS = JSON.parse(fs.readFileSync("./src/dbs/defaults.json", "utf8"));

// Bail if we fail to get server profile information
if (!DEFAULTS) {
  console.log("🔴Failed to get server profile information.")
  process.exit(1)
}

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

process.on('exit', function() {
});

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
})();
