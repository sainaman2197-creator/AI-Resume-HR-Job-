import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, Float

try:
    from .database import Base
except ImportError:
    from database import Base


class CandidateProfile(Base):
    __tablename__ = "candidate_profiles"

    id = Column(Integer, primary_key=True, index=True)
    candidate_name = Column(String(255), index=True)
    email = Column(String(255))
    phone = Column(String(50))
    location = Column(String(255))
    career_summary = Column(Text)
    total_experience_years = Column(String(50))
    seniority_level = Column(String(50), index=True)
    target_job_title = Column(String(255), index=True)
    functional_expertise = Column(String(255))
    leadership = Column(String(255))
    education = Column(Text)
    capability_tags = Column(JSON, default=list)
    skills = Column(Text)
    projects = Column(Text)
    resume_text = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True)
    company = Column(String(255))
    location = Column(String(255), default="Remote")
    experience_level = Column(String(50), default="Mid-Level")
    required_skills = Column(JSON, default=list)
    description = Column(Text)
    salary_range = Column(String(100), default="Competitive")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String(255))
    raw_text = Column(Text)
    ats_score = Column(Integer, default=0)
    experience_years = Column(String(50), default="0")
    skills = Column(JSON, default=list)
    mistakes = Column(JSON, default=list)
    missing_skills = Column(JSON, default=list)
    strengths = Column(JSON, default=list)
    analysis = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)