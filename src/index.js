require('dotenv').config();
const { Client, IntentsBitField } = require('discord.js');
const eventHandler = require('./handlers/eventHandler');

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

eventHandler(client);

if (process.env.NODE_ENV === 'development') {
  // Run the development bot logic
  console.log('Running in development mode');
  client.login(process.env.TOKEN_DEV);
} else {
  // Run the main bot logic
  console.log('Running in main mode');
  client.login(process.env.TOKEN);
}
