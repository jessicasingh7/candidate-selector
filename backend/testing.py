import json

def get_candidates():
    with open('candidates.json') as f:
        data = json.load(f)
    print(json.dumps(data, indent=2))  # Pretty-print JSON
    return data  # No need for jsonify here

get_candidates()