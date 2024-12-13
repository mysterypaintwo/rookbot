const areCommandsDifferent = require('../../utils/areCommandsDifferent')
const getLocalCommands = require('../../utils/getLocalCommands')
const fs = require('fs/promises')

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

module.exports = async (client) => {
  let help = {}
  try {
    const testGuildID = process.env.GUILD_ID
    const localCommands = getLocalCommands(client)

    // Determine if we are in development or production mode
    let isDevelopment = process.env.ENV_ACTIVE === 'development'
    let commandsManager = null

    if (isDevelopment) {
      const testGuild = client.guilds.cache.get(testGuildID)
      if (!testGuild) {
        console.error(`❌ Test guild not found: ${testGuildID}`)
        return
      }
      console.log(`🛠 Running in development mode. Using test server: ${testGuildID}`)
      commandsManager = testGuild.commands
    } else {
      console.log('🌐 Running in production mode. Registering global commands.')
      commandsManager = client.application.commands
    }

    const applicationCommands = await commandsManager.fetch()
    client.commands = {}

    for (const localCommand of localCommands) {
      let {
        name,
        category,
        description,
        options = [],
        access,
        autocomplete = null,
        deleted
      } = localCommand
      let slimoptions = []
      for(let option of options) {
        slimoptions.push(
          {
            name: option.name,
            description: option.description,
            required: option.required
          }
        )
      }
      if(!(category in help)) {
        help[category] = {}
      }
      help[category][name] = {
        name: name,
        category: category,
        description: description,
        options: slimoptions,
        access: access,
        segment: "local"
      }

      const existingCommand = applicationCommands.find(cmd => cmd.name === name)

      if (existingCommand) {
        if (deleted) {
          console.log(`🗑 Deleting: "${name}"`)
          try {
            await commandsManager.delete(existingCommand.id)
            delete client.commands[name]
          } catch (error) {
            console.error(`❌ Failed to delete: "${name}":`, error.message)
          }
          continue;
        }

        if (areCommandsDifferent(existingCommand, localCommand)) {
          console.log(`🔁 Updating: "${name}"`)
          try {
            await commandsManager.edit(existingCommand.id, { description, options, autocomplete })
            client.commands[name] = commandsManager.get(existingCommand.id)
          } catch (error) {
            if (error.code === 429) {
              console.warn(`⏳ Rate limit hit. Retrying for "${name}" after ${error.retry_after || 1000}ms.`)
              await wait(error.retry_after || 1000)
              await commandsManager.edit(existingCommand.id, { description, options, autocomplete })
              client.commands[name] = commandsManager.get(existingCommand.id)
            } else {
              console.error(`❌ Failed to edit: "${name}":`, error.message)
            }
          }
        } else {
          console.log(`✅ Current: "${name}"`)
          client.commands[name] = existingCommand
        }
      } else {
        if (deleted) {
          console.log(`⏩ Skipping deleted: "${name}"`)
          continue
        }

        if (name.indexOf("Command") > -1) {
          let cmd = new localCommand()
          name = cmd.name
          category = cmd.category
          description = cmd.description
          options = cmd.options
          access = cmd.access
          autocomplete = cmd?.autocomplete ? cmd.autocomplete : null
        }

        console.log(`👍 Registering new: "${name}"`)
        try {
          let slimoptions = []
          for(let option of options) {
            slimoptions.push(
              {
                name: option.name,
                description: option.description,
                required: option.required
              }
            )
          }
          if(!(category in help)) {
            help[category] = {}
          }
          help[category][name] = {
            name: name,
            category: category,
            description: description,
            options: slimoptions,
            access: access,
            segment: "new"
          }
          let newCommand = await commandsManager.create({ name, description, options, autocomplete })
          client.commands[name] = newCommand
        } catch (error) {
          if (error.code === 429) {
            console.warn(`⏳ Rate limit hit. Retrying for "${name}" after ${error.retry_after || 1000}ms.`)
            await wait(error.retry_after || 1000)
            let newCommand = await commandsManager.create({ name, description, options, autocomplete })
            client.commands[name] = newCommand
          } else {
            console.error(`❌ Failed to register: "${name}":`, error.message)
          }
        }
      }
    }

    console.log('🎉 Registration completed');
    await fs.writeFile(
      "./src/res/app/manifests/help/help.json",
      (
        JSON.stringify(
          help,
          null,
          2
        ) +
        "\n"
      ).replace(/\n/g, "\r\n")
    )
  } catch (error) {
    console.error(`❌ Registration error: ${error.stack}`)
  }
}
