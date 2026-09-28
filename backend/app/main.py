import os
import sys
import json
import logging
from typing import List, Optional

# Path setup for direct and package execution
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from dotenv import load_dotenv
load_dotenv()

import pdfplumber
from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func, or_

from database import SessionLocal, engine, Base, get_db
import models
from ats_engine import analyze_resume_with_ai, calculate_job_match, COMMON_TECH_SKILLS
from bml_engine import run_bml_shortlisting_funnel

# Ensure tables exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Resume & PDF Analyzer API",
    description="Intelligent ATS Resume Scoring, PDF Parsing, Candidate Search, and Job Matching API",
    version="2.0.0"
)

# CORS configuration to allow local Vite frontend and client requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Pydantic Models -----------------

class JobCreate(BaseModel):
    title: str
    company: str
    location: Optional[str] = "Remote, India"
    experience_level: Optional[str] = "Mid-Level"
    required_skills: List[str]
    description: str
    salary_range: Optional[str] = "Competitive"

class ApiKeyUpdate(BaseModel):
    api_key: str

class HRFunnelRequest(BaseModel):
    job_id: Optional[int] = None
    title: Optional[str] = "Python Developer"
    required_skills: Optional[List[str]] = []
    experience_level: Optional[str] = "Mid-Level"
    min_experience_years: Optional[float] = 0.0
    description: Optional[str] = ""
    vacancy_count: Optional[int] = 1

# ----------------- Helper Functions -----------------

def get_top_jobs_for_resume(resume_skills: List[str], raw_text: str, db: Session, limit: int = 5):
    all_jobs = db.query(models.Job).all()
    job_matches = []
    for job in all_jobs:
        req_skills = job.required_skills if isinstance(job.required_skills, list) else []
        match_info = calculate_job_match(resume_skills, raw_text, req_skills, job.description)
        job_matches.append({
            "job_id": job.id,
            "title": job.title,
            "company": job.company,
            "location": job.location,
            "experience_level": job.experience_level,
            "salary_range": job.salary_range,
            "required_skills": req_skills,
            "match_percentage": match_info["match_percentage"],
            "matched_skills": match_info["matched_skills"],
            "missing_skills": match_info["missing_skills"]
        })
    job_matches.sort(key=lambda x: x["match_percentage"], reverse=True)
    return job_matches[:limit]

# ----------------- Root & Health -----------------

@app.get("/")
def home():
    return {
        "status": "online",
        "service": "AI Resume & PDF Analyzer API",
        "version": "2.0.0",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check(db: Session = Depends(get_db)):
    try:
        candidates_count = db.query(models.CandidateProfile).count()
        jobs_count = db.query(models.Job).count()
        resumes_count = db.query(models.Resume).count()
        api_key = os.getenv("GEMINI_API_KEY", "")
        has_valid_key = bool(api_key and api_key != "your_gemini_api_key_here")
        return {
            "status": "healthy",
            "database": "connected",
            "candidates_count": candidates_count,
            "jobs_count": jobs_count,
            "resumes_count": resumes_count,
            "gemini_configured": has_valid_key
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health check error: {str(e)}")

# ----------------- Resume Upload & Analysis -----------------

@app.post("/upload-resume/")
@app.post("/api/resumes/upload")
async def upload_and_analyze_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Invalid file format. Only PDF files (.pdf) are allowed.")

    # Extract text using pdfplumber
    try:
        raw_text = ""
        with pdfplumber.open(file.file) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    raw_text += text + "\n"
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read PDF file: {str(e)}")

    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="The PDF file is empty or does not contain selectable text.")

    # Analyze resume using Gemini AI / heuristic fallback
    analysis = analyze_resume_with_ai(raw_text)

    # Save to database
    db_resume = models.Resume(
        file_name=file.filename,
        raw_text=raw_text,
        ats_score=analysis.get("ats_score", 70),
        experience_years=str(analysis.get("experience_years", "0")),
        skills=analysis.get("skills", []),
        mistakes=analysis.get("mistakes", []),
        missing_skills=analysis.get("missing_skills", []),
        strengths=analysis.get("strengths", []),
        analysis=analysis
    )
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)

    # Compute top matching jobs
    top_jobs = get_top_jobs_for_resume(analysis.get("skills", []), raw_text, db, limit=4)

    return {
        "message": "Resume uploaded and analyzed successfully!",
        "resume_id": db_resume.id,
        "file_name": file.filename,
        "ats_score": db_resume.ats_score,
        "experience_years": db_resume.experience_years,
        "skills": db_resume.skills,
        "mistakes": db_resume.mistakes,
        "missing_skills": db_resume.missing_skills,
        "strengths": db_resume.strengths,
        "analysis": analysis,
        "matched_jobs": top_jobs
    }

@app.get("/api/resumes")
def get_resumes(limit: int = 20, db: Session = Depends(get_db)):
    resumes = db.query(models.Resume).order_by(models.Resume.created_at.desc()).limit(limit).all()
    return [
        {
            "id": r.id,
            "file_name": r.file_name,
            "ats_score": r.ats_score,
            "experience_years": r.experience_years,
            "skills": r.skills,
            "created_at": r.created_at.isoformat() if r.created_at else None
        }
        for r in resumes
    ]

@app.get("/api/resumes/{resume_id}")
def get_resume_detail(resume_id: int, db: Session = Depends(get_db)):
    resume = db.query(models.Resume).filter(models.Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    top_jobs = get_top_jobs_for_resume(resume.skills or [], resume.raw_text or "", db, limit=5)

    return {
        "id": resume.id,
        "file_name": resume.file_name,
        "ats_score": resume.ats_score,
        "experience_years": resume.experience_years,
        "skills": resume.skills,
        "mistakes": resume.mistakes,
        "missing_skills": resume.missing_skills,
        "strengths": resume.strengths,
        "analysis": resume.analysis,
        "created_at": resume.created_at.isoformat() if resume.created_at else None,
        "matched_jobs": top_jobs
    }

@app.delete("/api/resumes/{resume_id}")
def delete_resume(resume_id: int, db: Session = Depends(get_db)):
    resume = db.query(models.Resume).filter(models.Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    db.delete(resume)
    db.commit()
    return {"message": f"Resume #{resume_id} deleted successfully"}

# ----------------- Candidate Talent Pool -----------------

@app.get("/api/candidates")
def list_candidates(
    search: Optional[str] = None,
    seniority: Optional[str] = None,
    skill: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(models.CandidateProfile)

    if search:
        term = f"%{search}%"
        query = query.filter(
            or_(
                models.CandidateProfile.candidate_name.ilike(term),
                models.CandidateProfile.target_job_title.ilike(term),
                models.CandidateProfile.functional_expertise.ilike(term),
                models.CandidateProfile.skills.ilike(term),
                models.CandidateProfile.location.ilike(term)
            )
        )

    if seniority and seniority.lower() != "all":
        query = query.filter(models.CandidateProfile.seniority_level.ilike(f"%{seniority}%"))

    if skill:
        query = query.filter(models.CandidateProfile.skills.ilike(f"%{skill}%"))

    total = query.count()
    offset = (page - 1) * limit
    candidates = query.order_by(models.CandidateProfile.id.asc()).offset(offset).limit(limit).all()

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit,
        "candidates": [
            {
                "id": c.id,
                "candidate_name": c.candidate_name,
                "email": c.email,
                "phone": c.phone,
                "location": c.location,
                "career_summary": c.career_summary,
                "total_experience_years": c.total_experience_years,
                "seniority_level": c.seniority_level,
                "target_job_title": c.target_job_title,
                "functional_expertise": c.functional_expertise,
                "leadership": c.leadership,
                "education": c.education,
                "capability_tags": c.capability_tags or [],
                "skills": c.skills,
                "projects": c.projects
            }
            for c in candidates
        ]
    }

@app.get("/api/candidates/{candidate_id}")
def get_candidate(candidate_id: int, db: Session = Depends(get_db)):
    c = db.query(models.CandidateProfile).filter(models.CandidateProfile.id == candidate_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return {
        "id": c.id,
        "candidate_name": c.candidate_name,
        "email": c.email,
        "phone": c.phone,
        "location": c.location,
        "career_summary": c.career_summary,
        "total_experience_years": c.total_experience_years,
        "seniority_level": c.seniority_level,
        "target_job_title": c.target_job_title,
        "functional_expertise": c.functional_expertise,
        "leadership": c.leadership,
        "education": c.education,
        "capability_tags": c.capability_tags or [],
        "skills": c.skills,
        "projects": c.projects,
        "resume_text": c.resume_text
    }

# ----------------- Jobs & Openings -----------------

@app.get("/api/jobs")
def list_jobs(db: Session = Depends(get_db)):
    jobs = db.query(models.Job).order_by(models.Job.id.asc()).all()
    return [
        {
            "id": j.id,
            "title": j.title,
            "company": j.company,
            "location": j.location,
            "experience_level": j.experience_level,
            "required_skills": j.required_skills or [],
            "description": j.description,
            "salary_range": j.salary_range,
            "created_at": j.created_at.isoformat() if j.created_at else None
        }
        for j in jobs
    ]

@app.post("/api/jobs")
def create_job(job_data: JobCreate, db: Session = Depends(get_db)):
    new_job = models.Job(
        title=job_data.title,
        company=job_data.company,
        location=job_data.location,
        experience_level=job_data.experience_level,
        required_skills=job_data.required_skills,
        description=job_data.description,
        salary_range=job_data.salary_range
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return {"message": "Job created successfully", "job_id": new_job.id}

@app.get("/api/jobs/{job_id}")
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {
        "id": job.id,
        "title": job.title,
        "company": job.company,
        "location": job.location,
        "experience_level": job.experience_level,
        "required_skills": job.required_skills or [],
        "description": job.description,
        "salary_range": job.salary_range
    }

@app.delete("/api/jobs/{job_id}")
def delete_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    db.delete(job)
    db.commit()
    return {"message": f"Job #{job_id} deleted successfully"}

# ----------------- AI Matching Endpoints -----------------

@app.post("/api/match/job-to-candidates/{job_id}")
def match_job_to_candidates(job_id: int, limit: int = 10, db: Session = Depends(get_db)):
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    candidates = db.query(models.CandidateProfile).all()
    req_skills = job.required_skills if isinstance(job.required_skills, list) else []

    ranked = []
    for cand in candidates:
        cand_skills = [s.strip() for s in str(cand.skills).split(",") if s.strip()]
        match_info = calculate_job_match(cand_skills, cand.resume_text or "", req_skills, job.description)
        ranked.append({
            "candidate_id": cand.id,
            "candidate_name": cand.candidate_name,
            "target_job_title": cand.target_job_title,
            "total_experience_years": cand.total_experience_years,
            "seniority_level": cand.seniority_level,
            "location": cand.location,
            "skills": cand.skills,
            "match_percentage": match_info["match_percentage"],
            "matched_skills": match_info["matched_skills"],
            "missing_skills": match_info["missing_skills"]
        })

    ranked.sort(key=lambda x: x["match_percentage"], reverse=True)
    return {
        "job": {
            "id": job.id,
            "title": job.title,
            "company": job.company,
            "required_skills": req_skills
        },
        "top_candidates": ranked[:limit]
    }

# ----------------- HR 2-Stage Shortlisting Funnel (Top 10 -> Top 5) -----------------

@app.post("/api/hr/match-funnel")
def run_hr_shortlisting_funnel(request: HRFunnelRequest, db: Session = Depends(get_db)):
    # 1. Resolve Job Details
    job_title = request.title or "Software Developer"
    required_skills = request.required_skills or []
    experience_level = request.experience_level or "Mid-Level"
    min_experience_years = request.min_experience_years or 0.0
    job_description = request.description or ""
    vacancy_count = request.vacancy_count or 1

    if request.job_id:
        existing_job = db.query(models.Job).filter(models.Job.id == request.job_id).first()
        if existing_job:
            job_title = existing_job.title
            required_skills = existing_job.required_skills if isinstance(existing_job.required_skills, list) else []
            experience_level = existing_job.experience_level
            job_description = existing_job.description or ""

    # 2. Fetch all candidates from DB (150 candidates)
    candidates = db.query(models.CandidateProfile).all()
    if not candidates:
        raise HTTPException(status_code=404, detail="No candidates found in the database. Please seed candidate profiles.")

    cand_list = [
        {
            "id": c.id,
            "candidate_name": c.candidate_name,
            "email": c.email,
            "phone": c.phone,
            "location": c.location,
            "career_summary": c.career_summary,
            "total_experience_years": c.total_experience_years,
            "seniority_level": c.seniority_level,
            "target_job_title": c.target_job_title,
            "education": c.education,
            "skills": c.skills,
            "projects": c.projects,
            "resume_text": c.resume_text
        }
        for c in candidates
    ]

    # 3. Run BML Shortlisting Funnel (Scanned -> Top 10 -> Top 5)
    funnel_result = run_bml_shortlisting_funnel(
        candidates_list=cand_list,
        job_title=job_title,
        required_skills=required_skills,
        experience_level=experience_level,
        min_experience_years=min_experience_years,
        job_description=job_description,
        vacancy_count=vacancy_count
    )

    return funnel_result

# ----------------- Analytics & Aggregations -----------------

@app.get("/api/analytics")
def get_analytics(db: Session = Depends(get_db)):
    total_candidates = db.query(models.CandidateProfile).count()
    total_jobs = db.query(models.Job).count()
    total_resumes = db.query(models.Resume).count()
    avg_ats = db.query(func.avg(models.Resume.ats_score)).scalar() or 75.0

    # Skill frequency across candidates
    candidates = db.query(models.CandidateProfile.skills).all()
    skill_counts = {}
    for (skills_str,) in candidates:
        if skills_str:
            for s in str(skills_str).split(","):
                s_clean = s.strip()
                if len(s_clean) > 1:
                    skill_counts[s_clean] = skill_counts.get(s_clean, 0) + 1

    sorted_skills = sorted(skill_counts.items(), key=lambda x: x[1], reverse=True)[:10]
    top_skills_data = [{"skill": s[0], "count": s[1]} for s in sorted_skills]

    # Seniority counts
    seniority_counts = db.query(
        models.CandidateProfile.seniority_level,
        func.count(models.CandidateProfile.id)
    ).group_by(models.CandidateProfile.seniority_level).all()

    seniority_data = [{"level": level or "Mid-Level", "count": count} for level, count in seniority_counts]

    # Recent uploaded resumes
    recent_resumes = db.query(models.Resume).order_by(models.Resume.created_at.desc()).limit(5).all()
    recent_resumes_data = [
        {
            "id": r.id,
            "file_name": r.file_name,
            "ats_score": r.ats_score,
            "created_at": r.created_at.strftime("%b %d, %H:%M") if r.created_at else ""
        }
        for r in recent_resumes
    ]

    return {
        "total_candidates": total_candidates,
        "total_jobs": total_jobs,
        "total_resumes_analyzed": total_resumes,
        "average_ats_score": round(float(avg_ats), 1),
        "top_skills": top_skills_data,
        "seniority_distribution": seniority_data,
        "recent_resumes": recent_resumes_data
    }

# ----------------- Settings / API Key -----------------

@app.get("/api/settings/api-key")
def get_api_key_status():
    current_key = os.getenv("GEMINI_API_KEY", "")
    is_valid = bool(current_key and current_key != "your_gemini_api_key_here")
    masked = f"{current_key[:4]}...{current_key[-4:]}" if is_valid and len(current_key) > 8 else "Not configured"
    return {
        "is_configured": is_valid,
        "masked_key": masked
    }

@app.post("/api/settings/api-key")
def update_api_key(data: ApiKeyUpdate):
    os.environ["GEMINI_API_KEY"] = data.api_key.strip()
    return {"message": "Gemini API key updated successfully", "is_configured": True}