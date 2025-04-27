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
                "rebroadcast": True,
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
                        
                sleep(0.2)

            except requests.exceptions.RequestException as e:
                    error_entry = {
                        "timestamp": datetime.now().isoformat(),
                        "type": "error",
                        "error_type": str(type(e).__name__),
                        "message": str(e),
                        "element_id": element.get('annId')
                    }
                    logger.error(json.dumps(error_entry))

        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(new_data, f, indent=4)

        print(f"Processed {len(new_data)} elements. Output saved to {output_file}")

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

def compare_csl(file1, file2):
    # Function to load song names from a JSON file
    def load_song_names(filename):
        with open(filename, 'r', encoding='utf-8') as f:
            data = json.load(f)
        # Extract "songName" from each element, assuming each element is a dict
        return [item.get('songName') for item in data if 'songName' in item]

    songs1 = load_song_names(file1)
    songs2 = load_song_names(file2)

    # Convert lists to sets for easier comparison
    set1 = set(songs1)
    set2 = set(songs2)

    # Songs only in file1
    only_in_file1 = set1 - set2

    # Songs only in file2
    only_in_file2 = set2 - set1

    print(f"Songs only in {file1}:")
    for song in only_in_file1:
        print(song)

    print(f"\nSongs only in {file2}:")
    for song in only_in_file2:
        print(song)
      
        
# main
file1 = 'CSLsongs.json'
file2 = 'CSLsongs2.json'

process_json_elements(file1, file2)
compare_csl(file1, file2)