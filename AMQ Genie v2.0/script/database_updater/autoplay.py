import pyautogui as pag
import keyboard as key
import time
import pyperclip as clip
import json
import os

startPosition = [745, 95]
progressPosition = [745, 90]
inputPosition = [745, 620]
outputPosition = [745, 135]
extensionPosition = [1850, 50]
file_path = os.path.dirname(__file__)
database_path = file_path + "/../../database/database.json"

def waitFor(x):
    time.sleep(x)

def clickOn(position, action):
    pag.moveTo(position, duration=0.2)
    
    if action == "single":
        pag.click()
    elif action == "double":
        pag.doubleClick()
    elif action == "triple":
        pag.tripleClick()

def gameProgress(progress):
    progress = progress.split("/")
    try:
        return int(progress[0]) / int(progress[1])
    except:
        return -1

def copy():
    with pag.hold('ctrl'):
        pag.press('c')

def cut():
    with pag.hold('ctrl'):
        pag.press('x')

def paste():
    return clip.paste()

def normalize(string):
    return string.replace('\r', '').replace('\n', '')

def appendToJson(keyword, value, jsonFile):
    with open(jsonFile, "r") as f:
        data = json.loads(f.read())
        
    data[keyword] = value

    with open(jsonFile, 'w') as f:
        f.write(json.dumps(data, sort_keys=True, ensure_ascii=True, indent=4, separators=(',', ': ')))
    

while True:
    
    clickOn(startPosition, action="single")
    lastSong = False
    waitFor(0.5)
    clickOn(progressPosition, action="triple")
    copy()

    if gameProgress(normalize(paste())) != 1:
        while gameProgress(normalize(paste())) <= 1 and gameProgress(normalize(paste())) >= 0: 
            if (gameProgress(normalize(paste())) == 1):
                lastSong = True
            if (gameProgress(normalize(paste())) == 0):
                waitFor(0.2)
                clickOn(progressPosition, action="triple")
                copy()
            else:
                clickOn(extensionPosition, action="single")
                clickOn(inputPosition, action="triple")
                copy()
                code = paste()

                if len(normalize(code)) == 6 and normalize(code).islower():
                    clickOn(inputPosition, action="triple")
                    cut()
                    clickOn(outputPosition, action="triple")
                    copy()
                    
                    while normalize(paste()) == "?" or normalize(paste()) == "":
                        waitFor(0.2)
                        clickOn(outputPosition, action="triple")
                        copy()

                    appendToJson(code, normalize(paste()), database_path)

                clickOn(outputPosition, action="triple")
                copy()

                while normalize(paste()) == "?" or normalize(paste()) == "":
                    waitFor(0.2)
                    clickOn(outputPosition, action="triple")
                    copy()
                    
                    if normalize(paste()) != "?":
                        if code == normalize(paste()):
                            break

                while normalize(paste()) != "?":
                    waitFor(0.5)
                    clickOn(outputPosition, action="triple")
                    copy()
                    if lastSong:
                        break

                if lastSong:
                    break

                else:
                    clickOn(progressPosition, action="triple")
                    copy()