import os
import sys

# Set up paths
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

import pandas as pd
from database import SessionLocal
import models

def load_candidates():
    csv_paths = [
        os.path.join(os.path.dirname(__file__), "../../dataset/ai_resume_analyzer_100_resumes.csv"),
        os.path.join(os.path.dirname(__file__), "../../dataset/resumes.csv"),
        "C:/Users/hp/Desktop/ai_resume_analyzer_100_resumes.csv"
    ]
    csv_path = None
    for p in csv_paths:
        if os.path.exists(p):
            csv_path = p
            break

    if not csv_path:
        print("Error: candidate CSV file not found.")
        return

    df = pd.read_csv(csv_path)
    db = SessionLocal()
    print(f"Total candidates in CSV: {len(df)}")

    try:
        for _, row in df.iterrows():
            tags = [t.strip() for t in str(row.get("capability_tags", "")).split(",") if t.strip()] if pd.notna(row.get("capability_tags")) else []
            cand = models.CandidateProfile(
                candidate_name=str(row.get("candidate_name", "")) if pd.notna(row.get("candidate_name")) else "Candidate",
                email=str(row.get("email", "")) if pd.notna(row.get("email")) else "",
                phone=str(row.get("phone", "")) if pd.notna(row.get("phone")) else "",
                location=str(row.get("location", "")) if pd.notna(row.get("location")) else "",
                career_summary=str(row.get("career_summary", "")) if pd.notna(row.get("career_summary")) else "",
                total_experience_years=str(row.get("total_experience_years", "0")),
                seniority_level=str(row.get("seniority_level", "Mid-Level")),
                target_job_title=str(row.get("target_job_title", "Software Developer")),
                functional_expertise=str(row.get("functional_expertise", "")),
                leadership=str(row.get("leadership", "")),
                education=str(row.get("education", "")),
                capability_tags=tags,
                skills=str(row.get("skills", "")),
                projects=str(row.get("projects", "")),
                resume_text=str(row.get("resume_text", ""))
            )
            db.add(cand)
        db.commit()
        print(f"Success: {len(df)} candidates successfully loaded into database!")
    except Exception as e:
        db.rollback()
        print(f"Error inserting candidates: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    load_candidates()