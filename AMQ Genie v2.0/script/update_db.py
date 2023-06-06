import pyautogui as pag
import time
import pytesseract as loki
import json
import keyboard
import os



file_path = os.path.dirname(__file__)
database_path = file_path + "/../database/database.json"

def appendToJson(keyword, value, jsonFile):
    with open(jsonFile, "r") as f:
        data = json.loads(f.read())
        
    data[keyword] = value

    with open(jsonFile, 'w') as f:
        f.write(json.dumps(data, sort_keys=True, ensure_ascii=True, indent=4, separators=(',', ': ')))

