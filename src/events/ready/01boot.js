const manageCommands = require('../../utils/manageCommands.js')
const getProfile = require('../../utils/getProfile.js')

module.exports = async (client, profileName) => {
  let GLOBALS = getProfile(
    profileName ||
    client.profileName
  )

  // Optional: Delete commands if enabled in the profile
  if (GLOBALS.deleteCommands) {
    await manageCommands(
      GLOBALS.deleteCommands,
      process.env.GUILD_ID,
      GLOBALS.name,
      process.env.CLIENT_ID,
      process.env.TOKEN
    )
  } else {
    console.log('  🟢 Command deletion is disabled.')
  }
}
