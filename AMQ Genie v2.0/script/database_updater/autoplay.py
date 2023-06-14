import pyautogui as pag
import keyboard as key
import time
import pyperclip as clip
import json
import os

startPosition = [745, 95]
progressPosition = [745, 90]
inputPosition = [745, 600]
outputPosition = [745, 135]
extensionPosition = [1735, 50]
file_path = os.path.dirname(__file__)
database_path = file_path + "/../../database/database.json"
'''
- Quando il valore finale di prova arriva a 1 la partita è finita.
prova = "5/20"
prova = prova.split("/")
print(int(prova[0]) / int(prova[1]))
'''





'''
while True: 
    if key.is_pressed('q'):
        x, y = pag.position()
        print(x, y)
'''

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
        return 0

def copy():
    with pag.hold('ctrl'):
        pag.press('c')

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

    while (gameProgress(normalize(paste())) <= 1):
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
                clickOn(outputPosition, action="triple")
                copy()
                
                while normalize(paste()) == "?" or normalize(paste()) == "":
                    waitFor(0.2)
                    clickOn(outputPosition, action="triple")
                    copy()

                appendToJson(code, normalize(paste()), database_path)
            if lastSong:
                break
            else:
                clickOn(progressPosition, action="triple")
                copy()





