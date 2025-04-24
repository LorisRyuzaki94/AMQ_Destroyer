import json
import requests
from time import sleep
import logging
from datetime import datetime
from pathlib import Path

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

def process_json_elements(input_file, output_file):
    logger = configure_logging(input_file)
    
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        if not isinstance(data, list):
            data = [data]  # Ensure we're working with a list

        new_data = []
        missing_songs = []
        
        for element in data:
            # Initialize all filters as False
            filters = {
                "opening_filter": False,
                "ending_filter": False,
                "insert_filter": False
            }
            
            # Set the appropriate filter based on songType
            song_type = element.get("songType")
            if isinstance(song_type, int):
                if song_type == 1:
                    filters["opening_filter"] = True
                elif song_type == 2:
                    filters["ending_filter"] = True
                elif song_type == 3:
                    filters["insert_filter"] = True
            elif isinstance(song_type, str):
                if "Opening" in song_type:
                    filters["opening_filter"] = True
                elif "Ending" in song_type:
                    filters["ending_filter"] = True
                elif "Insert" in song_type:
                    filters["insert_filter"] = True
            
            # Create request body
            body = {
                "and_logic": True,
                "ignore_duplicate": True,
                **filters,  # Spread the filters into the body
                "normal_broadcast": True,
                "dub": False,
                "rebroadcast": False,
                "standard": True,
                "instrumental": False,
                "chanting": False,
                "character": False
                }

            # Add conditional filters
            if 'animeEnglishName' in element:
                body["anime_search_filter"] = {
                    "search": element['animeEnglishName'],
                    "partial_match": False
                }
            elif 'animeENName' in element:
                body["anime_search_filter"] = {
                    "search": element['animeENName'],
                    "partial_match": False
                }
            
            if 'songName' in element:
                body["song_name_search_filter"] = {
                    "search": element['songName'],
                    "partial_match": False
                }
            
            if 'songArtist' in element:
                body["artist_search_filter"] = {
                    "search": element['songArtist'],
                    "partial_match": False
                }

            logger.info(json.dumps({
                "timestamp": datetime.now().isoformat(),
                "type": "request",
                "body": body
            }))

            # Make API call
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
                
                if length == 0 or length > 1:
                    song = {
                        "songName": element["songName"],
                        "songArtist": element["songArtist"]
                    }
                    missing_songs.append(song)
                    continue
                
                # Log response details
                logger.info(json.dumps({
                    "timestamp": datetime.now().isoformat(),
                    "type": "response",
                    "status": response.status_code,
                    "length": length,
                    "response": response_data
                }))

                for item in response_data:
                    if item['songName'] == element['songName']:
                        new_data.append(item)
                    else:
                        song = {
                            "songName": element["songName"],
                            "songArtist": element["songArtist"]
                        }
                        missing_songs.append(song)
                        
                sleep(0.1)

            except requests.exceptions.RequestException as e:
                    error_entry = {
                        "timestamp": datetime.now().isoformat(),
                        "type": "error",
                        "error_type": str(type(e).__name__),
                        "message": str(e),
                        "element_id": element.get('annId')
                    }
                    logger.error(json.dumps(error_entry))
                    element['api_error'] = error_entry

        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(new_data, f, indent=4)

        print(f"Processed {len(new_data)} elements. Output saved to {output_file}")
        print("The following songs are missing:")
        for songs in missing_songs:
            print(songs)

    except FileNotFoundError:
        logger.error(json.dumps({
            "timestamp": datetime.now().isoformat(),
            "error": f"File {input_file} not found"
        }))
    except json.JSONDecodeError:
        logger.error(json.dumps({
            "timestamp": datetime.now().isoformat(),
            "error": f"Invalid JSON in {input_file}"
        }))
    except Exception as e:
        logger.error(json.dumps({
            "timestamp": datetime.now().isoformat(),
            "error": f"Critical error: {str(e)}"
        }))

process_json_elements('CSLsongs.json', 'CSLsongs2.json')
