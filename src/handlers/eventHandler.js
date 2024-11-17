import path from 'path'
import { fileURLToPath } from 'url';
import getAllFiles from '../utils/getAllFiles.js'

let eventHandler = (client) => {
  const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
  const __dirname = path.dirname(__filename); // get the name of the directory
  const eventFolders = getAllFiles(
    path.join(
      __dirname,
      '..',
      'events'
    ),
    true
  );

  for (const eventFolder of eventFolders) {
    let eventFiles = getAllFiles(eventFolder);
    eventFiles = eventFiles.sort();

    const eventName = eventFolder.replace(/\\/g, '/').split('/').pop();

    client.on(eventName, async (...args) => {
      for (let eventFile of eventFiles) {
        let event = null
        if (eventFile.substring(1,3) == ":\\") {
          eventFile = "file:///" + eventFile
        }
        if (!eventFile.includes(".json")) {
          let { default: event } = await import(eventFile)
        }
        if (event) {
          await event(client, ...args); // Pass all arguments to the event function
        }
      }
    });
  }
};

export default eventHandler
