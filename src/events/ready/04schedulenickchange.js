const { RookEmbed } = require('../../classes/embed/rembed.class.js')
const shell = require('shelljs')
const fs = require('fs')
const scheduleNicknameChange = require('../../utils/scheduleNicknameChange');

module.exports = async (client) => {
    // Schedule the nickname change
    let guild = await client.guilds.cache.find(g => g.id === '745409743593406634');
    const doiGuildID = '1282788953052676177';
    const castIeUserID = `1111517386588307536`;
    try {
      const isDoI = guild.id === doiGuildID;
      const member = await guild.members.fetch(castIeUserID, { force: true }).catch(err => {
        console.error("Fetch error:", err);
      });

      if (!member || !member.user) {
        throw new Error("Member not found or invalid data.");
      }

      await scheduleNicknameChange(client, member, isDoI);
    } catch (error) {
      const isDoI = false;
      const member = null;
    }
}
