const schedule = require('node-schedule');
const { changeNickname } = require('../utils/changeNickname');  // Import the changeNickname function

function scheduleNicknameChange(client, member, isDoI) {
  const midnightPacific = { hour: 0, minute: 0, tz: "America/Los_Angeles" };

  // Schedule the task at midnight Pacific Time
  schedule.scheduleJob(midnightPacific, async () => {
    try {

      // Call the changeNickname function to change the nickname
      const result = await changeNickname(client, member, isDoI);

      // Check the result and log accordingly
      if (result.success) {
        console.log(`Changed nickname of ${member.user.tag} to "${result.message}".`);
      } else {
        console.error(`Error changing nickname for ${member.user.tag}: ${result.message}`);
      }
    } catch (err) {
      console.error("Error changing nickname:", err);
    }
  });

  console.log("Scheduled nickname changes for user:", member.id);
}

module.exports = scheduleNicknameChange;
