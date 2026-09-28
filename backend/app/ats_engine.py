import re
import json
import os
import math
from typing import List, Dict, Any
import google.generativeai as genai

# Comprehensive tech and domain skills taxonomy for heuristic detection and enrichment
COMMON_TECH_SKILLS = [
    "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "Go", "Rust", "PHP", "Ruby", "Swift", "Kotlin",
    "FastAPI", "Django", "Flask", "React", "Vue.js", "Angular", "Next.js", "Node.js", "Express.js",
    "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Cassandra", "DynamoDB", "Snowflake",
    "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Terraform", "CI/CD", "Linux", "Git", "GitHub", "GitLab",
    "Machine Learning", "Deep Learning", "PyTorch", "TensorFlow", "Scikit-learn", "Pandas", "NumPy",
    "NLP", "Computer Vision", "LLM", "Gemini API", "OpenAI", "LangChain", "RAG", "Vector DB", "Hugging Face",
    "REST APIs", "GraphQL", "Microservices", "RabbitMQ", "Kafka", "Celery", "Elasticsearch",
    "HTML", "CSS", "Tailwind CSS", "Bootstrap", "Redux", "Airflow", "Apache Spark", "Tableau", "Power BI",
    "Agile", "Scrum", "JIRA", "PyTest", "Selenium", "Postman", "System Design", "Cybersecurity", "Network Security"
]

def extract_contact_info(text: str) -> Dict[str, str]:
    email_match = re.search(r"[\w\.-]+@[\w\.-]+\.\w+", text)
    phone_match = re.search(r"(\+?\d{1,3}[-.\s]?)?\(?\d{3,5}\)?[-.\s]?\d{3,5}[-.\s]?\d{4,6}", text)
    
    email = email_match.group(0) if email_match else ""
    phone = phone_match.group(0).strip() if phone_match else ""
    return {"email": email, "phone": phone}

def extract_skills_heuristic(text: str) -> List[str]:
    text_lower = f" {text.lower()} "
    found_skills = []
    for skill in COMMON_TECH_SKILLS:
        pattern = r"(?i)(^|[^a-zA-Z0-9_#+])" + re.escape(skill) + r"($|[^a-zA-Z0-9_#+])"
        if re.search(pattern, text_lower):
            found_skills.append(skill)
    return list(dict.fromkeys(found_skills))

def extract_experience_heuristic(text: str) -> str:
    # Look for patterns like "3.5 years", "3+ years", "4 yrs experience"
    exp_match = re.search(r"(\d+(?:\.\d+)?)\s*\+?\s*(?:years|year|yrs)\b", text, re.IGNORECASE)
    if exp_match:
        return exp_match.group(1)
    
    # Check date ranges e.g. 2021 - 2024
    years = re.findall(r"\b(20\d\d|19\d\d)\b", text)
    if len(years) >= 2:
        try:
            int_years = sorted([int(y) for y in years])
            diff = int_years[-1] - int_years[0]
            if 0 < diff <= 40:
                return str(diff)
        except Exception:
            pass
    return "1-3"

def run_heuristic_analysis(raw_text: str) -> Dict[str, Any]:
    """Fallback deterministic ATS analysis when Gemini API is offline or not configured."""
    contacts = extract_contact_info(raw_text)
    detected_skills = extract_skills_heuristic(raw_text)
    experience_years = extract_experience_heuristic(raw_text)

    # Heuristic scoring components
    score = 40 # baseline
    mistakes = []
    strengths = []
    missing_skills = []

    # 1. Contact info check
    if contacts["email"] and contacts["phone"]:
        score += 15
        strengths.append("Clear and standard contact information (email & phone detected).")
    elif not contacts["email"]:
        mistakes.append("Missing or unparseable email address in header.")
    elif not contacts["phone"]:
        mistakes.append("Missing contact telephone number.")

    # 2. Key sections detection
    text_lower = raw_text.lower()
    has_experience = any(k in text_lower for k in ["experience", "employment history", "work history"])
    has_education = any(k in text_lower for k in ["education", "degree", "university", "college", "bachelor", "master"])
    has_skills = any(k in text_lower for k in ["skills", "technical skills", "technologies", "expertise"])
    has_projects = any(k in text_lower for k in ["project", "projects", "portfolio"])

    if has_experience:
        score += 10
        strengths.append("Includes dedicated Work Experience / Employment section.")
    else:
        mistakes.append("Add a distinct 'Work Experience' or 'Employment History' section header.")

    if has_education:
        score += 8
    else:
        mistakes.append("Education section is missing or lacks standard heading.")

    if has_skills:
        score += 10
        strengths.append("Dedicated Technical Skills section detected.")
    else:
        mistakes.append("Add a clearly labeled 'Technical Skills' summary section.")

    if has_projects:
        score += 7
        strengths.append("Showcases practical projects and real-world implementations.")

    # 3. Measurable metrics & numbers
    num_metrics = len(re.findall(r"\b(\d+%\b|\$\d+|\b\d+\s*(?:k|x|users|requests|ms|million|gb|tb)\b)", raw_text, re.IGNORECASE))
    if num_metrics >= 3:
        score += 10
        strengths.append("Good usage of quantifiable metrics and measurable achievements.")
    else:
        mistakes.append("Quantify achievements with metrics (e.g., 'improved query speed by 35%', 'handled 50k requests').")

    # 4. Length and density
    word_count = len(raw_text.split())
    if 300 <= word_count <= 1200:
        score += 5
    elif word_count < 250:
        mistakes.append("Resume appears too brief. Expand on technical project details and responsibilities.")
    elif word_count > 1500:
        mistakes.append("Resume exceeds ideal 1-2 page length for ATS readability.")

    # Bound score
    score = min(96, max(35, score))

    # Recommendations for top skills
    recommended_pool = ["Docker", "Kubernetes", "AWS", "CI/CD", "PostgreSQL", "FastAPI", "System Design", "Git"]
    missing_skills = [s for s in recommended_pool if s not in detected_skills][:5]

    return {
        "skills": detected_skills if detected_skills else ["Python", "Git", "Problem Solving"],
        "experience_years": experience_years,
        "ats_score": score,
        "strengths": strengths if strengths else ["Well-structured technical background.", "Relevant education background."],
        "mistakes": mistakes if mistakes else ["Ensure consistent bullet point punctuation across all job entries."],
        "missing_skills": missing_skills,
        "summary": f"Candidate with ~{experience_years} years estimated experience possessing core skills in {', '.join(detected_skills[:4]) if detected_skills else 'software development'}.",
        "ai_powered": False
    }

def analyze_resume_with_ai(raw_text: str, api_key: str = None) -> Dict[str, Any]:
    """Analyzes resume text using Gemini 1.5/2.0 Flash or falls back to heuristic engine."""
    api_key = api_key or os.getenv("GEMINI_API_KEY", "")
    
    if api_key and api_key.strip() and api_key != "your_gemini_api_key_here":
        try:
            genai.configure(api_key=api_key.strip())
            
            prompt = f"""
You are an expert AI ATS (Applicant Tracking System) and Senior Technical Hiring Recruiter.
Analyze the following resume text comprehensively and objectively.

Return a STRICT, parseable JSON object with the following schema:
{{
  "candidate_name": "Full Name or null",
  "email": "Email address or null",
  "phone": "Phone number or null",
  "skills": ["Skill1", "Skill2", ...],
  "experience_years": "e.g. 3.5",
  "seniority_level": "Fresher" | "Junior" | "Mid-Level" | "Senior" | "Lead",
  "target_role": "Primary target role, e.g. Python Developer",
  "ats_score": integer between 0 and 100,
  "strengths": ["Strength 1", "Strength 2", ...],
  "mistakes": ["Mistake 1 / Formatting issue", "Mistake 2", ...],
  "missing_skills": ["Recommended Skill 1", "Recommended Skill 2", ...],
  "summary": "2-sentence executive summary of the candidate's profile"
}}

Scoring Guidelines for ATS Score (0-100):
- 85-100: Exceptional formatting, high quantifiable impact (% improvements, scale), clear standard headings, modern tech stack.
- 70-84: Solid resume, good technical keywords, standard sections, minor formatting or metric omissions.
- 50-69: Missing key metrics, brief or dense formatting, non-standard headings, or generic descriptions.
- Below 50: Severe lack of technical detail, missing contact information, or parsing difficulties.

Resume Text:
{raw_text}
"""
            # Try latest Gemini models in order of availability
            model_names = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-2.0-flash", "gemini-pro"]
            response = None
            last_err = None
            
            for m_name in model_names:
                try:
                    model = genai.GenerativeModel(m_name)
                    response = model.generate_content(prompt)
                    if response and response.text:
                        break
                except Exception as e:
                    last_err = e
                    continue
            
            if response and response.text:
                cleaned_text = response.text.replace("```json", "").replace("```", "").strip()
                ai_data = json.loads(cleaned_text)
                ai_data["ai_powered"] = True
                
                # Normalize values
                if not isinstance(ai_data.get("skills"), list):
                    ai_data["skills"] = extract_skills_heuristic(raw_text)
                if not isinstance(ai_data.get("ats_score"), int):
                    try:
                        ai_data["ats_score"] = int(ai_data.get("ats_score", 75))
                    except Exception:
                        ai_data["ats_score"] = 75
                return ai_data
        except Exception as e:
            print(f"Gemini AI parsing failed, falling back to heuristic engine: {e}")
            
    # Fallback to deterministic heuristic engine
    result = run_heuristic_analysis(raw_text)
    return result

def calculate_job_match(resume_skills: List[str], resume_text: str, job_skills: List[str], job_description: str) -> Dict[str, Any]:
    """Calculates match score %, matched skills, and missing skills between resume and job."""
    resume_skills_lower = {s.lower().strip() for s in resume_skills}
    job_skills_lower = {s.lower().strip() for s in job_skills}
    resume_text_lower = resume_text.lower()
    
    # Direct skill intersection
    matched_skills = []
    missing_skills = []
    
    for js in job_skills:
        js_clean = js.strip()
        js_lower = js_clean.lower()
        if js_lower in resume_skills_lower or js_lower in resume_text_lower:
            matched_skills.append(js_clean)
        else:
            missing_skills.append(js_clean)
            
    total_req = len(job_skills)
    if total_req > 0:
        skill_score = (len(matched_skills) / total_req) * 80
    else:
        skill_score = 50
        
    # Textual keyword bonus (up to 20 pts)
    desc_words = [w for w in re.findall(r"\b[a-zA-Z]{4,}\b", job_description.lower()) if w not in ["with", "have", "will", "this", "from", "that"]]
    common_words = sum(1 for w in set(desc_words) if w in resume_text_lower)
    text_score = min(20, (common_words / max(1, len(desc_words))) * 40)
    
    match_percentage = min(98, max(20, round(skill_score + text_score)))
    
    return {
        "match_percentage": match_percentage,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills
    }
