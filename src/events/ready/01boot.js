const fs = require('fs');
const manageCommands = require('../../utils/manageCommands.js');
const scheduleNicknameChange = require('../../utils/scheduleNicknameChange');

module.exports = async (client) => {
  let GLOBALS = null;
  const defaults = JSON.parse(fs.readFileSync('./src/dbs/defaults.json', 'utf8'));

  try {
    if (fs.existsSync('./src/PROFILE.json')) {
      GLOBALS = JSON.parse(fs.readFileSync('./src/PROFILE.json', 'utf8'));
    } else {
      console.log(' 🟡Ready Event: PROFILE manifest not found! Using defaults!');
    }

    GLOBALS = (
      GLOBALS?.selectedprofile &&
      GLOBALS?.profiles &&
      GLOBALS.selectedprofile in GLOBALS.profiles
    ) ?
      GLOBALS.profiles[GLOBALS.selectedprofile] :
      defaults;
  } catch (err) {
    console.log('  🔴Ready Event: PROFILE manifest not found!');
    process.exit(1);
  }

  // Optional: Delete commands if enabled in the profile
  if (GLOBALS.deleteCommands) {
    await manageCommands(
      GLOBALS.deleteCommands,
      GLOBALS.targetserver,
      GLOBALS.name,
      process.env.DISCORD_CLIENT_ID,
      process.env.TOKEN
    );
  } else {
    console.log('  🟢 Command deletion is disabled.');
  }

  // Schedule the nickname change
  const targetGuildId = GLOBALS.targetserver;
  const castIeUserID = 1111517386588307536;

  scheduleNicknameChange(client, targetGuildId, castIeUserID);
};
