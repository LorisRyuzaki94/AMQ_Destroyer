import pyautogui as pag
import time
import pytesseract as loki
import json
import keyboard
import os
import pyperclip as clip


file_path = os.path.dirname(__file__)
database_path = file_path + "/../../database/database.json"
settings_path = file_path + "/../settings.json"

def appendToJson(keyword, value, jsonFile):
    with open(jsonFile, "r") as f:
        data = json.loads(f.read())
        
    data[keyword] = value

    with open(jsonFile, 'w') as f:
        f.write(json.dumps(data, sort_keys=True, ensure_ascii=True, indent=4, separators=(',', ': ')))

def clickOn(position):
    pag.click(position)

def tripleClickOn(position):
    pag.tripleClick(position)

def copySelected():
    with pag.hold('ctrl'):
        pag.press('c')

def locateExtension():
    return pag.locateCenterOnScreen(file_path + "/images/logo.png")

def loadDatabase(jsonFile):
    with open(database_path, "r") as f: # Apro il database JSON
        return json.loads(f.read())
    
def normalize(string):
    return string.replace('\r', '').replace('\n', '')

with open(settings_path, "r") as config:
    settings = json.load(config)

searching = True
#extensionRegion = [settings['extension-position'][0], settings['extension-position'][1]] # pos estensione (da utilizzare)
markRegion = [settings['mark-position'][0], settings['mark-position'][1]] # pos punto di domanda
inputRegion = [settings['input-position'][0], settings['input-position'][1]] # pos campo di input

while not keyboard.is_pressed('q'):
    while searching:
        softLock = True
        waitingName = True

        tripleClickOn(markRegion) # Triplo click sul punto di domanda
        copySelected()

        if normalize(clip.paste()) == "?": # Se è un punto di domanda...
            clickOn(locateExtension())

            time.sleep(2)

            tripleClickOn(inputRegion) # Triplo click sul codice o il nome dell'anime che scrive l'estensione
            copySelected()

            code = normalize(clip.paste()) # Variabile che memorizza codice
            data = loadDatabase(database_path)

            if code not in data and len(code) == 6: # Da rivedere il controllo della lunghezza (è stupida come cosa)
                while waitingName:
                    tripleClickOn(markRegion)
                    copySelected()

                    time.sleep(1)

                    if normalize(clip.paste()) != '?' and normalize(clip.paste()) != '':
                        appendToJson(code, normalize(clip.paste()), database_path)
                        print('added to database')
                        print('\t- ' + normalize(clip.paste()) + ' with code ' + code + "\n")
                        data = loadDatabase(database_path)
                        waitingName = False
                
                    else:
                        time.sleep(1)

                while softLock:
                    tripleClickOn(markRegion) # Triplo click sul punto di domanda
                    copySelected()

                    if normalize(clip.paste()) == '?':
                        softLock = False
            else:
                print('already in database')
                print('\t- ' + normalize(clip.paste()))
                
                while softLock:
                    tripleClickOn(markRegion) # Triplo click sul punto di domanda
                    copySelected()

                    while normalize(clip.paste()) != code:
                        tripleClickOn(markRegion) # Triplo click sul punto di domanda
                        copySelected()
                        softLock = False
        

