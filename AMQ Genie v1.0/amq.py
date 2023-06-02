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
INFO = PATH_AMQ_DESTROYER + "/images/info.png"

TesseractPath = r'C:/Program Files/Tesseract-OCR/tesseract.exe'

if not os.path.exists(TesseractPath):
    for root, dirs, files in os.walk(r'C:/'):
        for name in files:

            # As we need to get the provided python file,
            # comparing here like this
            if name == "tesseract.exe":
                print(os.path.abspath(os.path.join(root, name)))

loki.pytesseract.tesseract_cmd = TesseractPath

with open(PATH_AMQ_DESTROYER + "/settings.json", "r") as config:
    settings = json.load(config)

with open(DATABASE, "r") as db:
    data = json.load(db)

searching = True
anime = ""
clicked = False
annullaRegion = [settings['shazam-position'][0] - 75, settings['shazam-position'][1] + 30, 85, 20]
markRegion = [settings['mark-position'][0] - 165, settings['mark-position'][1] - 30, 330, 60]
screenshotRegion = [settings['shazam-position'][0] - 410, settings['shazam-position'][1] + 30, 420, 180]
added = False


def normalize(reading):
    replacements = [(".", ""), ("‘", "")]
    for char, replacement in replacements:
        if char in reading:
            reading = reading.replace(char, replacement)

    return reading


def appendToJson(keyword, keyword2, value, jsonFile):
    with open(jsonFile, "r") as file:
        data = json.loads(file.read())

    if keyword not in data:
        data[keyword] = {keyword2: value}
    else:
        data[keyword].update({keyword2: value})

    with open(jsonFile, 'w') as file:
        file.write(json.dumps(data, sort_keys=True, indent=4, separators=(',', ': ')))

# appendToJson("lisa", "adamas", "Sword Art Online: Alicization", "/db.json")


while not keyboard.is_pressed("q"):
    pag.screenshot(MARK, region=markRegion)

    while searching:

        if loki.image_to_string(MARK) == "":
            if not clicked:
                pag.click(settings['shazam-position'])
                clicked = True
                time.sleep(4)
                pag.screenshot(ANNULLA, region=annullaRegion)

            if not pag.locateCenterOnScreen(ANNULLA):

                pag.screenshot(INFO, region=screenshotRegion)
                info = loki.image_to_string(INFO).split('\n')
                while '' in info:
                    info.remove('')
                try:
                    band = info[len(info) - 1]
                    song = info[0]
                except:
                    print("errore\n\tproblema nel riconoscimento del testo")
                pag.click(settings['input-position'])

                try:
                    anime = (data[normalize(band.lower())][normalize(song.lower())])
                    print("trovato\n\t" + band + "\t" + song + "\t" + anime)
                except:
                    if not pag.locateCenterOnScreen(PATH_AMQ_DESTROYER + '/images/error.png'):
                        while not added:
                            time.sleep(1)
                            pag.screenshot(MARK, region=markRegion)
                            if not loki.image_to_string(MARK) == "":
                                appendToJson(normalize(band).lower(), normalize(song).lower(), loki.image_to_string(MARK).replace('\n', " "), DATABASE)
                                print("aggiunto al database:\n\t- " + band + "\t" + song + "\t" + loki.image_to_string(MARK))
                                added = True
                            else:
                                print("error\n\tno audio")
                                pag.click(settings['input-position'])
                    else:
                        print("error\n\tno audio")
                        pag.click(settings['input-position'])


                pag.write(anime)
                pag.press('enter')

                searching = False
        else:
            pag.screenshot(MARK, region=markRegion)

    while not searching:
        pag.screenshot(MARK, region=markRegion)
        if loki.image_to_string(MARK) != "":
            searching = True
            clicked = False
            added = False

        else:
            time.sleep(0.1)
