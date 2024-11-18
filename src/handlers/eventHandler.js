import path from 'path'
import { fileURLToPath } from 'url';
import getAllFiles from '../utils/getAllFiles.js'

function isClass(obj) {
  const isCtorClass = obj.constructor
      && obj.constructor.toString().substring(0, 5) === 'class'
  if(obj.prototype === undefined) {
    return isCtorClass
  }
  const isPrototypeCtorClass = obj.prototype.constructor
    && obj.prototype.constructor.toString
    && obj.prototype.constructor.toString().substring(0, 5) === 'class'
  return isCtorClass || isPrototypeCtorClass
}

let eventHandler = async (client) => {
  const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
  const __dirname = path.dirname(__filename); // get the name of the directory
  let eventFolders = getAllFiles(
    path.join(
      __dirname,
      '..',
      'events'
    ),
    true
  );

  for (const eventFolder of eventFolders) {
    let eventFiles = getAllFiles(eventFolder);
    eventFiles = eventFiles.sort()

    const eventName = eventFolder.replace(/\\/g, '/').split('/').pop()
    console.log("Found event:", eventName)
    console.log(" Found scripts:", eventFiles)

    client.on(eventName, async (...args) => {
      console.log("  Registering event:",eventName)
      for (let eventFile of eventFiles) {
        let fileSlug = eventFile.substring(eventFile.indexOf("events") + "events".length + 1)
        console.log("   Loading script:",fileSlug)
        let event = null
        if (!eventFile.includes(".json") && !eventFile.includes(".off")) {
          if (eventFile.substring(1,3) == ":\\") {
            eventFile = "file:///" + eventFile
          }
          console.log(`    Registering script: ${fileSlug}`)
          let { default: event } = await import(eventFile)
          if (event) {
            if (!isClass(event)) {
              await event(client, ...args); // Pass all arguments to the event function
            } else if(isClass(event)) {
              let func = new event(client)
              await func.execute(client)
            }
          }
        }
      }
    })
  }
}

export default eventHandler
