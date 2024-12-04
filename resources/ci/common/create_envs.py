import os

with open(".env", encoding="utf-8") as envFile:
    envData = envFile.read()
    as_line = False
    path_line = False
    assign_line = False
    envPath = ""
    envLines = []
    for line in envData.split("\n"):
        line = line.strip()
        if " as " in line or " to " in line:
            as_line = True
            path_line = False
            assign_line = False
            if len(envLines) > 2:
                print(envPath)
                with open(envPath, "w", encoding="utf-8") as thisEnvFile:
                    toPrint = "\n".join(envLines)
                    thisEnvFile.write(toPrint)
                envLines = []
        if ": " in line:
            as_line = False
            path_line = True
            assign_line = False
        if "=" in line:
            as_line = False
            path_line = False
            assign_line = True
        if as_line:
            user = line
            envLines.append(line)
        if path_line:
            path = line
            envPath = line[line.find(": ")+2:].strip()
            envLines.append(line)
        if assign_line:
            envLines.append(line)

if len(envLines) > 2:
    print(envPath)
    with open(envPath, "w", encoding="utf-8") as thisEnvFile:
        toPrint = "\n".join(envLines)
        thisEnvFile.write(toPrint)
    envLines = []
