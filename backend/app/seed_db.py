import os
import sys
import pandas as pd

# Add app to path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from database import engine, SessionLocal, Base
import models

def seed_database(force_refresh=False):
    print("Creating tables if they do not exist...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Candidate CSV Paths
    candidate_csv_paths = [
        os.path.join(parent_dir, "../dataset/resumes.csv"),
        os.path.join(parent_dir, "../dataset/ai_resume_analyzer_100_resumes.csv"),
        "x:/pdf analyser/dataset/resumes.csv"
    ]
    
    cand_csv = None
    for p in candidate_csv_paths:
        if os.path.exists(p):
            cand_csv = p
            break

    candidates_count = db.query(models.CandidateProfile).count()
    print(f"Current candidate profiles in DB: {candidates_count}")

    if cand_csv:
        df_cand = pd.read_csv(cand_csv)
        total_in_csv = len(df_cand)
        if candidates_count < total_in_csv or force_refresh:
            print(f"Syncing {total_in_csv} candidates from {cand_csv} (current: {candidates_count})...")
            # Clear existing if force refresh
            if force_refresh or candidates_count > 0:
                print("Clearing candidate profiles table...")
                db.query(models.CandidateProfile).delete(synchronize_session=False)
                db.commit()
                print("Table cleared.")

            cands_to_add = []
            for _, row in df_cand.iterrows():
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
                cands_to_add.append(cand)
            db.bulk_save_objects(cands_to_add)
            db.commit()
            print(f"Successfully seeded {len(cands_to_add)} candidate profiles!")
        else:
            print(f"Candidates already up-to-date ({candidates_count} in DB).")
    else:
        print("Candidate CSV not found.")

    # 2. Seed Jobs
    jobs_count = db.query(models.Job).count()
    print(f"Current jobs in DB: {jobs_count}")

    job_csv_path = os.path.join(parent_dir, "../dataset/jobs.csv")
    if os.path.exists(job_csv_path) and (jobs_count == 0 or force_refresh):
        print(f"Seeding jobs from {job_csv_path}...")
        if force_refresh and jobs_count > 0:
            db.query(models.Job).delete(synchronize_session=False)
            db.commit()

        df_jobs = pd.read_csv(job_csv_path)
        jobs_to_add = []
        for _, row in df_jobs.iterrows():
            req_skills = [s.strip() for s in str(row.get("required_skills", "")).split(",") if s.strip()]
            job = models.Job(
                title=str(row.get("title", "")),
                company=str(row.get("company", "")),
                location=str(row.get("location", "Remote, India")),
                experience_level=str(row.get("experience_level", "Mid-Level")),
                required_skills=req_skills,
                description=str(row.get("description", "")),
                salary_range=str(row.get("salary_range", "Competitive"))
            )
            jobs_to_add.append(job)
        db.bulk_save_objects(jobs_to_add)
        db.commit()
        print(f"Successfully seeded {len(jobs_to_add)} jobs!")
    else:
        print(f"Jobs already populated ({jobs_count} in DB).")

    db.close()
    print("Database seeding completed!")

if __name__ == "__main__":
    force = "--force" in sys.argv
    seed_database(force_refresh=force)
