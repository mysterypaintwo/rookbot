const path = require('path');
const getAllFiles = require('../utils/getAllFiles');

module.exports = (client) => {
  const eventFolders = getAllFiles(path.join(__dirname, '..', 'events'), true);
  console.log("Loading events from:", eventFolders);  // Debug log

  for (const eventFolder of eventFolders) {
    let eventFiles = getAllFiles(eventFolder);
    eventFiles = eventFiles.sort();

    const eventName = eventFolder.replace(/\\/g, '/').split('/').pop();
    console.log(`Registering event: ${eventName}`);  // Debug log

    client.on(eventName, async (...args) => {
      for (const eventFile of eventFiles) {
        const eventFunction = require(eventFile);
        await eventFunction(client, ...args); // Pass all arguments to the event function
      }
    });
  }
};
