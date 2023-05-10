import pyautogui as pag
import time
import pytesseract as loki
import json
import keyboard
import os

PATH_AMQ_DESTROYER = os.path.dirname(__file__)
DATABASE = PATH_AMQ_DESTROYER + "/db.json"
MARK = PATH_AMQ_DESTROYER + "/images/mark.png"
ANNULLA = PATH_AMQ_DESTROYER + "/images/annulla.png"
BAND = PATH_AMQ_DESTROYER + "/images/band.png"
SONG = PATH_AMQ_DESTROYER + "/images/song.png"

TesseractPath = r'C:/Program Files/Tesseract-OCR/tesseract.exe'

if not os.path.exists(TesseractPath):
    for root, dirs, files in os.walk(r'C:/'):
        for name in files:
       
          # As we need to get the provided python file,
        # comparing here like this
            if name == "tesseract.exe": 
                print(os.path.abspath(os.path.join(root, name)))

loki.pytesseract.tesseract_cmd = TesseractPath

with open(DATABASE, "r") as db:
    data = json.load(db)

searching = True
anime = ""
clicked = False

while not keyboard.is_pressed("q"):
    pag.screenshot(MARK, region=(580, 110, 330, 60))

    while searching:

        if (loki.image_to_string(MARK) == ""):
            if not clicked:
                pag.click(1705, 50)
                clicked = True
                time.sleep(3)
                pag.screenshot(ANNULLA, region=(1680, 85, 85, 40))

            if (pag.locateCenterOnScreen(ANNULLA) == None):
                if (pag.locateCenterOnScreen(PATH_AMQ_DESTROYER + '/images/error.png') == None):
                    pag.screenshot(BAND, region=(1350, 180, 410, 50))
                    pag.screenshot(SONG, region=(1350, 130, 410, 50))
                    band = (loki.image_to_string(BAND)).replace('\n', '')
                    song = (loki.image_to_string(SONG)).replace('\n', '')

                    pag.click(750, 600)

                    try:
                        anime = (data[band.lower()][song.lower()])
                        print("trovato\n\t"+band+"\t"+song+"\t"+anime)
                    except:
                        print("non presente nel database:\n\t- "+band+"\t"+song)
                        
                    pag.write(anime)
                    pag.press('enter')
                
                else:
                    print("error\n\tno audio")
                    pag.click(640, 695)

                searching = False
        else:
            pag.screenshot(MARK, region=(580, 110, 330, 60))

    while not searching:
        pag.screenshot(MARK, region=(690, 180, 60, 70))
        if (loki.image_to_string(MARK) != ""):
            searching = True
            clicked = False
        time.sleep(1)


def appendToJson(keyword, keyword2, value, jsonFile):
    with open(PATH_AMQ_DESTROYER + jsonFile, "r") as file:
        data = json.loads(file.read())

    if keyword not in data:
        data[keyword] = {keyword2 : value}
    else: 
        data[keyword].update({keyword2 : value})

    with open(PATH_AMQ_DESTROYER + jsonFile, 'w') as file:
        file.write(json.dumps(data, sort_keys=True, indent=4, separators=(',', ': ')))

#appendToJson("lisa", "adamas", "Sword Art Online: Alicization", "/db.json")
