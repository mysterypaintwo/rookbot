const nicknames = require('../dbs/castIe');  // Import the nickname arrays

// Main function to compare commands
module.exports = (client, member, isDoI) => {
  changeNickname(client, member, isDoI)
}

// Function to change a member's nickname
async function changeNickname(client, member, isDoI) {
  try {
    if (client?.guilds) {
      for (let [ guildID, guildData ] of client.guilds.cache) {
        let castleMember = member

        if (castleMember) {
          // Weighted random selection for the nickname
          let randomWord
          const randomChoice = Math.random()

          if (randomChoice < 0.7) {  // 70% chance for "topPicks"
            randomWord = nicknames.topPicks[Math.floor(Math.random() * nicknames.topPicks.length)]
          } else if (randomChoice < 0.85) {  // 15% chance for "castleSynonyms"
            randomWord = nicknames.castleSynonyms[Math.floor(Math.random() * nicknames.castleSynonyms.length)]
          } else {  // 15% chance for "meh"
            randomWord = nicknames.meh[Math.floor(Math.random() * nicknames.meh.length)]
          }

          /// Change castIe's nickname
          // If we're specifically on the DoI server, prepend [Admin] to the start of the username
          if (isDoI) {
            randomWord = `[Admin] ${randomWord}`
          }
          await castleMember.setNickname(randomWord)

          return {
            success: true,
            message: `Changed nickname to "${randomWord}".`
          }
        }
      }
    }
  } catch(error) {
    console.error('Error changing nickname:', error)
    return {
      success: false,
      message: `There was an error changing the nickname: ${error.message}`
    }
  }
}

module.exports = { changeNickname }
