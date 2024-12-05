import json
import os
from shutil import copy

copy(
    os.path.join(".","src","PROFILE-example.json"),
    os.path.join(".","src","PROFILE.json")
)
with open(os.path.join(".","src","PROFILE.json"), "r+", encoding="utf-8") as profileFile:
    profileJSON = json.load(profileFile)
    profileJSON["selectedprofile"] = "gitrook"
    json.dump(profileFile, profileJSON)
