const fs = require('fs');
const manageCommands = require('../../utils/manageCommands.js');

module.exports = async (client) => {
  let profileName = "default"
  let defaults = {}
  try {
    /**
     * Profile properties
     * @type {Object.<string, any>}
     */
    defaults = JSON.parse(fs.readFileSync("./src/dbs/defaults.json", "utf8"))
  } catch(err) {
    console.log("🔴Boot Sequence: DEFAULTS manifest not found!")
    process.exit(1)
  }

  let GLOBALS = {}
  try {
    /**
     * Global properties
     * @type {Object.<string, any>}
     */
    if (fs.existsSync("./src/PROFILE.json")) {
      GLOBALS = JSON.parse(fs.readFileSync("./src/PROFILE.json", "utf8"))
    } else {
      console.log("🟡Hello Sequence: PROFILE manifest not found! Using defaults!")
    }
    if (
      GLOBALS?.selectedprofile &&
      GLOBALS?.profiles &&
      GLOBALS.selectedprofile in GLOBALS.profiles
    ) {
      GLOBALS[GLOBALS.selectedprofile]
    } else {
      GLOBALS = defaults
    }
  } catch(err) {
    console.log("🔴Hello Sequence: PROFILE manifest not found!")
    process.exit(1)
  }

  let PACKAGE = {}
  try {
    /**
     * Package properties
     * @type {Object.<string, any>}
     */
    PACKAGE = JSON.parse(fs.readFileSync("./package.json","utf8"))
  } catch(err) {
    console.log("🔴Hello Sequence: PACKAGE manifest not found!")
    process.exit(1)
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
};
