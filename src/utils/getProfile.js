const fs = require('fs')

const getProfile = (profileName="default") => {
  let profile = {}
  let defaults = {}

  // console.log(`Searching for '${profileName}' Profile!`)

  try {
    defaults = JSON.parse(fs.readFileSync("./src/dbs/defaults.json", "utf8"))
  } catch(err) {
    console.log("🔴getProfile: DEFAULTS manifest not found!")
    process.exit(1)
  }

  try {
    if (fs.existsSync("./src/PROFILE.json")) {
      profile = JSON.parse(fs.readFileSync("./src/PROFILE.json", "utf8"))
    } else {
      console.log("🟡getProfile: PROFILE manifest not found! Using defaults!")
    }

    if (
      profileName &&
      profile?.profiles &&
      profileName in profile.profiles
    ) {
      profile = profile.profiles[profileName]
      // console.log(`Loaded '${profileName}' Profile!`)
    } else {
      profile = defaults
      // console.log("Loaded Default Profile!")
    }
  } catch(err) {
    console.log("🔴getProfile: PROFILE manifest not found!")
    console.log(err.stack)
    process.exit(1)
  }

  profile.defaults = defaults
  profile.profileName = profileName

  try {
    profile.PACKAGE = JSON.parse(fs.readFileSync("./package.json", "utf8"))
  } catch(err) {
    console.log("🔴getProfile: PACKAGE manifest not found!")
    console.log(err.stack)
    process.exit(1)
  }

  return profile
}

module.exports = getProfile
