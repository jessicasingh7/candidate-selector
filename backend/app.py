from flask import Flask, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)
    
def load_candidates():
    with open("candidates.json") as f:
        return json.load(f)

def education_score(candidate):
    degrees = candidate.get("education", {}).get("degrees", [])
    gpa = 0
    highest_level_score = 0

    if candidate.get("education", {}).get("highest_level") == "Doctorate":
        highest_level_score = 3.5
    elif candidate.get("education", {}).get("highest_level") == "Master's Degree":
        highest_level_score = 2.5
    elif candidate.get("education", {}).get("highest_level") == "Juris Doctor (J.D)":
        highest_level_score = 2.5
    elif candidate.get("education", {}).get("highest_level") == "Bachelor's Degree":
        highest_level_score = 2
    elif candidate.get("education", {}).get("highest_level") == "Associate's Degree":
        highest_level_score = 1
    
    for degree in degrees:
        if degree.get("gpa") == "Cum Laude":
            gpa = 3.69
        elif degree.get("gpa") == "Magna Cum Laude":
            gpa = 3.89
        elif degree.get("gpa") == "Summa Cum Laude":
            gpa = 4.0
        elif degree.get("gpa")[:3] == "GPA":
            gpa = float(degree.get("gpa")[-3:])

    if len(degrees) > 0:
        gpa = gpa/len(degrees)
    num_degrees = len(degrees)

    return num_degrees + highest_level_score + gpa

def skills_score(candidate):
    return len(candidate.get("skills", []))

def experience_score(candidate):
    return len(candidate.get("work_experiences", []))

def rank_candidates(candidates):
    def score(candidate):
        return experience_score(candidate) * 3 + skills_score(candidate) * 2 + education_score(candidate) * 4

    candidates.sort(key=score, reverse=True)
    return candidates[:5]

@app.route('/candidates', methods=['GET'])
def get_candidates():
    candidates = load_candidates()
    return jsonify(candidates)

@app.route("/candidates/<candidate_name>", methods=["GET"])
def get_candidate_details(candidate_name):
    candidates = load_candidates()
    for candidate in candidates:
        if candidate.get("name") == candidate_name:
            return jsonify(candidate)

    return jsonify({"message": "Candidate not found"}), 404

@app.route("/top-education", methods=["GET"])
def get_top_education():
    candidates = load_candidates()
    candidates.sort(key=education_score, reverse=True)
    return jsonify(candidates[:5])

@app.route("/top-work", methods=["GET"])
def get_top_work():
    candidates = load_candidates()
    candidates.sort(key=lambda candidate: education_score(candidate) + skills_score(candidate), reverse=True)
    return jsonify(candidates[:5])

@app.route("/top-candidates", methods=["GET"])
def get_top_candidates():
    candidates = load_candidates()
    top_candidates = rank_candidates(candidates)
    return jsonify(top_candidates)

if __name__ == '__main__':
    app.run(debug=True)
