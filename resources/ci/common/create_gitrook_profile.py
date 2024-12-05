import json
import os
from shutil import copy

copy(
    os.path.join(".","PROFILE-example.json"),
    os.path.join("PROFILE.json")
)
with open(os.path.join(".","PROFILE.json"), "w", encoding="utf-8") as profileFile:
    profileJSON = json.load(profileFile)
    profileJSON["selectedprofile"] = "gitrook"
    json.dump(profileFile, profileJSON)
