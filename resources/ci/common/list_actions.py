# pylint: disable=invalid-name
'''
List GitHub Actions versions used and latest versions
'''
import json
import os
import ssl
import urllib.request
import yaml
from json.decoder import JSONDecodeError

allACTIONS = {}
listACTIONS = []

lengths = {
    "filenameLine": 40,
    "filenameSpacer": 5,
    "version": 10,
    "textSpacer": 2
}

def process_walk(key, node):
    '''
    Process walking through the array
    '''
    global allACTIONS
    global listACTIONS
    if key == "uses":
        action = node.split('@')
        version = ""
        if '@' in node:
            version = action[1]
        action = action[0]
        if action not in allACTIONS:
            allACTIONS[action] = {
                "versions": [],
                "latest": ""
            }
        allACTIONS[action]["versions"].append(version)
        allACTIONS[action]["versions"] = list(
            set(
                allACTIONS[action]["versions"]
            )
        )
        listACTIONS.append(node)


def walk(key, node):
    '''
    How to walk through the array
    '''
    if isinstance(node, dict):
        return {k: walk(k, v) for k, v in node.items()}
    elif isinstance(node, list):
        return [walk(key, x) for x in node]
    else:
        return process_walk(key, node)

output = []

for r, d, f in os.walk(os.path.join(".", ".github")):
    if "actions" in r or "workflows" in r:
        for filename in f:
            if (".yml" not in filename and ".yaml" not in filename) or (".off" in filename):
                continue
            listACTIONS = []
            output.append(
                "┌" +
                ("-" * (len(os.path.join(r, filename)) + 2)) +
                "┐"
            )
            output.append("| " + os.path.join(r, filename) + " |")
            with(open(os.path.join(r, filename), "r", encoding="utf-8")) as yamlFile:
                output.append(
                    "├" +
                    ("-" * (lengths["filenameLine"] + lengths["filenameSpacer"] + (lengths["version"] * 2) + lengths["textSpacer"])) +
                    " "
                )
                yml = yaml.safe_load(yamlFile)
                walk("uses", yml)
                dictACTIONS = {}
                for k in sorted(list(set(listACTIONS))):
                    action = k.split('@')[0]
                    version = k.split('@')[1] if '@' in k else ""
                    latest = ""
                    if "./." not in action:
                        apiURL = f"https://api.github.com/repos/{action}/releases/latest"
                        if True:
                            apiReq = None
                            try:
                                apiReq = urllib.request.urlopen(
                                    apiURL,
                                    context=ssl._create_unverified_context()
                                )
                            except urllib.error.HTTPError as e:
                                if e.code != 403:
                                    print(e.code, apiURL)
                            if apiReq:
                                apiRes = {}
                                try:
                                    apiRes = json.loads(
                                        apiReq.read().decode("utf-8"))
                                except JSONDecodeError as e:
                                    raise ValueError("API Request failed: " + apiURL)
                                if apiRes:
                                    latest = apiRes["tag_name"] if "tag_name" in apiRes else ""
                                    if latest != "":
                                        allACTIONS[action]["latest"] = latest
                    dictACTIONS[action] = version
                for action, version in dictACTIONS.items():
                    output.append(
                        "| " +
                        f"{action.ljust(lengths['filenameLine'])}" +
                        "\t" +
                        f"{(version or 'N/A').ljust(lengths['version'])}" +
                        "\t" +
                        f"{allACTIONS[action]['latest']}" +
                        " |"
                    )
                output.append(
                    "└" +
                    ("-" * (lengths["filenameLine"] + lengths["filenameSpacer"] + (lengths["version"] * 2) + lengths["textSpacer"])) +
                    " "
                )
            output.append("")

first = True
for action, actionData in allACTIONS.items():
    if len(actionData["versions"]) > 0:
        if actionData["latest"] != "" and actionData["versions"][0] != actionData["latest"]:
            if first:
                output.append(
                    "┌" +
                    ("-" * (len("| Outdated |") - 2)) +
                    "┐"
                )
                output.append("| Outdated |")
                output.append(
                    "├" +
                    ("-" * (len("| Outdated |") - 2)) +
                    "┴"
                )
            first = False

            output.append(
                "| " + \
                f"{action.ljust(lengths['filenameLine'])}" + \
                "\t" + \
                f"{(','.join(actionData['versions']) or 'N/A').ljust(lengths['version'])}" + \
                "\t" + \
                f"{actionData['latest'].ljust(lengths['version'])}" + \
                " |"
            )

print("\n".join(output))

with open(os.path.join(".",".github","workflows","actions.txt"), "w", encoding="utf-8") as actionsFile:
    actionsFile.write("\n".join(output))
