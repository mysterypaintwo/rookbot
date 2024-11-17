import path from 'path'
import { fileURLToPath } from 'url';
import getAllFiles from '../utils/getAllFiles.js'

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

        if (exceptions.includes(commandObject.name)) {
          continue;
        }

        localCommands.push(commandObject);
      }
    }
  }

  return localCommands;
};

export default getLocalCommands
