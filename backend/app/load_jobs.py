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

def load_jobs_from_csv():
    csv_path = os.path.join(os.path.dirname(__file__), "../../dataset/jobs.csv")

    if not os.path.exists(csv_path):
        print(f"Error: {csv_path} not found. Please check file path.")
        return

    df = pd.read_csv(csv_path)
    db = SessionLocal()

    print(f"Total jobs found in CSV: {len(df)}")

    try:
        for _, row in df.iterrows():
            skills_list = [skill.strip() for skill in str(row["required_skills"]).split(",") if skill.strip()]
            db_job = models.Job(
                title=str(row["title"]),
                company=str(row["company"]),
                location=str(row.get("location", "Remote, India")),
                experience_level=str(row.get("experience_level", "Mid-Level")),
                required_skills=skills_list,
                description=str(row["description"]),
                salary_range=str(row.get("salary_range", "Competitive"))
            )
            db.add(db_job)

        db.commit()
        print(f"Success: {len(df)} jobs successfully inserted!")
    except Exception as e:
        db.rollback()
        print(f"Error while inserting jobs: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    load_jobs_from_csv()