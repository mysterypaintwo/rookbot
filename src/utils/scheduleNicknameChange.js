const schedule = require('node-schedule');
const { changeNickname } = require('../utils/changeNickname');  // Import the changeNickname function

function scheduleNicknameChange(client, guildId, userId) {
  const midnightPacific = { hour: 0, minute: 0, tz: "America/Los_Angeles" };

  // Schedule the task at midnight Pacific Time
  schedule.scheduleJob(midnightPacific, async () => {
    try {
      const guild = await client.guilds.fetch(guildId);
      const member = await guild.members.fetch(userId);

      if (!member) {
        console.error(`Member with ID ${userId} not found in guild ${guildId}.`);
        return;
      }

      // Call the changeNickname function to change the nickname
      const result = await changeNickname(member, guildId);

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

  console.log("Scheduled nickname changes for user:", userId);
}

module.exports = scheduleNicknameChange;
