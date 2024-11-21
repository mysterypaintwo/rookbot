const fs = require('fs');  // For reading the JSON file
const nicknames = require('../dbs/castIe');  // Import the nickname arrays

// Main function to compare commands
module.exports = (client, member) => {
  changeNickname(client, member);
};


// Function to change a member's nickname
async function changeNickname(client, member) {
  if (client?.guilds) {
    for (let [ guildID, guildData ] of client.guilds.cache) {
      let castleMember = member;

      if (castleMember) {
        //console.log(castleMember)
        let nick = "cassoe";
        await castleMember.setNickname(nick);
      }
    }
  }

  return [{success: true}];
}

module.exports = { changeNickname };
