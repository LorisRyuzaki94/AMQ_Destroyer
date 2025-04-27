import json
import requests
import logging
from datetime import datetime
from pathlib import Path
import os

def configure_logging(input_file):
    """Set up JSON logging using input filename"""
    filename = Path(input_file)
    log_filename = f"{filename.stem}_log_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    
    logging.basicConfig(
        level=logging.INFO,
        format='%(message)s',
        handlers=[
            logging.FileHandler(log_filename),
            logging.StreamHandler()
        ]
    )
    return logging.getLogger()

def add_song(anime, song, artist, output_file):
    logger = configure_logging(output_file)

    try:
        # Create request body
        body = {
            "and_logic": True,
            "ignore_duplicate": True,
            "opening_filter": True,
            "ending_filter": True,
            "insert_filter": True,
            "normal_broadcast": True,
            "dub": False,
            "rebroadcast": True,
            "standard": True,
            "instrumental": False,
            "chanting": False,
            "character": False
            }
        
        # Add conditional filters
        if anime:
            body["anime_search_filter"] = {
                "search": anime,
                "partial_match": True
            }
        
        if song:
            body["song_name_search_filter"] = {
                "search": song,
                "partial_match": True
            }
        
        if artist:
            body["artist_search_filter"] = {
                "search": artist,
                "partial_match": True
            }
            
            
        print(body)
        try:
            headers = {'Content-Type': 'application/json'}
            response = requests.post(
                'https://anisongdb.com/api/search_request',
                json=body,
                headers=headers,
                timeout=10
            )
            response.raise_for_status() # Raise HTTP errors
            
            response_data = response.json()
            length = len(response_data)
            
            # Log response details
            logger.info(json.dumps({
                "timestamp": datetime.now().isoformat(),
                "type": "response",
                "status": response.status_code,
                "length": length,
                "response": response_data
            }))
            
            for i in length:
                print(response_data[i])
                confirmation = input("Is this correct? (y/n): ").strip().lower()
                if confirmation == 'y':
                    # Append the response to a JSON file
                    if os.path.exists(output_file):
                        with open(output_file, 'r', encoding='utf-8') as f:
                            data = json.load(f)
                    else:
                        data = []
                    data.append(response_data[i])
                    with open(output_file, 'w', encoding='utf-8') as f:
                        json.dump(data, f, indent=4)
                        print("Response saved to responses.json")
                    break
                else:
                    print("Response not saved.")
        
        except requests.exceptions.RequestException as e:
            error_entry = {
                "timestamp": datetime.now().isoformat(),
                "type": "error",
                "error_type": str(type(e).__name__),
                "message": str(e)
            }
            logger.error(json.dumps(error_entry))

    except FileNotFoundError:
        logger.error(json.dumps({
            "timestamp": datetime.now().isoformat(),
            "error": f"File {output_file} not found"
        }))
    except json.JSONDecodeError:
        logger.error(json.dumps({
            "timestamp": datetime.now().isoformat(),
            "error": f"Invalid JSON in {output_file}"
        }))
    except Exception as e:
        logger.error(json.dumps({
            "timestamp": datetime.now().isoformat(),
            "error": f"Critical error: {str(e)}"
        }))

# main
file = 'CSLsongs2.json'

while (True):
    # Prompt user for input
    anime = input("Enter anime: ")
    song = input("Enter song: ")
    artist = input("Enter artist: ")

    add_song(anime, song, artist, file)