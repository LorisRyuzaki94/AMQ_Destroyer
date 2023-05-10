import pyautogui as pag
import time
import pytesseract as loki
import json
import keyboard

PATH_AMQ_DESTROYER = "C:/Users/user6_12_1/Desktop/AMQ_Bot/AMQ_Destroyer/"
MARK = PATH_AMQ_DESTROYER + "images/mark.png"
ANNULLA = PATH_AMQ_DESTROYER + "images/annulla.png"
BAND = PATH_AMQ_DESTROYER + "images/band.png"
SONG = PATH_AMQ_DESTROYER + "images/song.png"

loki.pytesseract.tesseract_cmd = r'C:/Program Files/Tesseract-OCR/tesseract.exe'

with open(PATH_AMQ_DESTROYER + "db.json", "r") as db:
    data = json.load(db)

searching = True
anime = ""
clicked = False

while not keyboard.is_pressed("q"):
    pag.screenshot(MARK, region=(690, 180, 60, 70))

    while searching:

        if (loki.image_to_string(MARK) == ""):
            if not clicked:
                pag.click(1690, 65)
                clicked = True
                time.sleep(3)
                pag.screenshot(ANNULLA, region=(1612, 93, 80, 40))

            if (pag.locateCenterOnScreen(ANNULLA) == None):
                if (pag.locateCenterOnScreen(PATH_AMQ_DESTROYER + 'images/error.png') == None):
                    pag.screenshot(BAND, region=(1300, 210, 400, 50))
                    pag.screenshot(SONG, region=(1300, 160, 400, 50))
                    band = (loki.image_to_string(BAND)).replace('\n', '')
                    song = (loki.image_to_string(SONG)).replace('\n', '')

                    pag.click(640, 695)
                    try:
                        anime = (data['latin'][band.lower()][song.lower()])
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
            pag.screenshot(MARK, region=(690, 180, 60, 70))

    while not searching:
        pag.screenshot(MARK, region=(690, 180, 60, 70))
        if (loki.image_to_string(MARK) != ""):
            searching = True
            clicked = False
        time.sleep(1)

'''
# Stampa le coordinate del cursore quando premi Q
while True:
    if keyboard.is_pressed('q'):
        x, y = pag.position()
        print(str(x)+", "+str(y))
        time.sleep(1)
'''