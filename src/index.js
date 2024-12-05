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
        let commandNames = [
          "uptime",
          "exit"
        ]
        for(let commandName of commandNames) {
          const commandObject = localCommands.find(
            (cmd) => cmd.name === commandName
          )
          if (commandObject) {
            let channelIDs = require(`./dbs/${process.env.GUILD_ID}/channels.json`)
            let channelID = channelIDs["bot-console"]
            let guild = await client.guilds.cache.find(g => g.id === process.env.GUILD_ID)
            if (guild) {
              let channel = await guild.channels.cache.find(c => c.id === channelID)
              let embed = new RookEmbed(props)
              await channel.send({ embeds: [ embed ] })
            }
            await commandObject.execute(
              client,
              {
                member: { user: { tag: "gitrook" } },
                user: {
                  name: "gitrook",
                  avatarURL: () => { return "https://cdn.discordapp.com/avatars/1313777189187223603/4bc7c1dc2b41b0bd7f77945bcc55feef.webp?size=128" },
                  username: "gitrook"
                },
                reply: async (props) => {
                  await channel.send(props)
                }
              }
            );
          } else {
            console.log(localCommands)
          }
        }
      } catch(err) {
        console.log(err.stack)
      }
    },
    60 * 1000)
  }
})()
