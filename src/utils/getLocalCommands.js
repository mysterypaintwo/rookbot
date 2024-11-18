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

let getLocalCommands = async (exceptions = []) => {
  const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
  const __dirname = path.dirname(__filename); // get the name of the directory

  let localCommands = [];

  const commandCategories = getAllFiles(
    path.join(__dirname, '..', 'commands'),
    true
  );

  for (const commandCategory of commandCategories) {
    const commandFiles = getAllFiles(commandCategory);

    for (let commandFile of commandFiles) {
      if (!commandFile.endsWith(".off")) {
        if (commandFile.substring(1,3) == ":\\") {
          commandFile = "file:///" + commandFile
        }
        const commandObject = await import(commandFile)
        let name = ""
        if (commandObject?.default?.name) {
          name = commandObject.default.name
        }
        if (isClass(commandObject)) {
          console.log("Is class:",commandObject)
          let command = new commandObject()
          name = command.name
        }

        if (exceptions.includes(commandObject.name)) {
          continue
        }

        localCommands[name] = commandObject
      }
    }
  }

  // console.log(localCommands)

  return localCommands
}

export default getLocalCommands
