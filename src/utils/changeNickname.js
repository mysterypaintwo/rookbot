const fs = require('fs');  // For reading the JSON file
const nicknames = require('../dbs/castIe');  // Import the nickname arrays

// Main function to compare commands
module.exports = (client, memberId, guildID) => {
  changeNickname(client, memberId, guildID);
};



// Function to change a member's nickname
async function changeNickname(client, memberId, guildID) {
    let user = client?.user

    console.log(`${user}`);
    if (client?.guilds) {
      for (let [ guildID, guildData ] of client.guilds.cache) {
        let clientMember = null
        if(user) {
          clientMember = await guildData.members.fetch(user.id)
        }

        if (clientMember) {
          let nick = clientMember?.nickname || clientMember.user.username
          // manip the nick here
          if (nick != (clientMember?.nickname || clientMember.user.username)) {
            clientMember.setNickname(nick)
          }
        }
      }
    }

}

module.exports = { changeNickname };
