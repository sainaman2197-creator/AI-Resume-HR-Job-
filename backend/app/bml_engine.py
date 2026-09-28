import re
import math
from collections import Counter
from typing import List, Dict, Any, Optional

# ----------------- Tech Skill Normalization & Synonyms -----------------

SKILL_SYNONYMS = {
    "python": ["python", "python3", "py"],
    "fastapi": ["fastapi", "fast api"],
    "django": ["django", "django rest framework", "drf"],
    "flask": ["flask"],
    "react": ["react", "react.js", "reactjs"],
    "vue": ["vue", "vue.js", "vuejs"],
    "angular": ["angular", "angularjs"],
    "javascript": ["javascript", "js", "ecmascript"],
    "typescript": ["typescript", "ts"],
    "node.js": ["node.js", "nodejs", "node"],
    "sql": ["sql", "rdbms"],
    "postgresql": ["postgresql", "postgres", "psql"],
    "mysql": ["mysql"],
    "mongodb": ["mongodb", "mongo", "nosql"],
    "redis": ["redis", "in-memory cache"],
    "docker": ["docker", "containerization", "containers"],
    "kubernetes": ["kubernetes", "k8s"],
    "aws": ["aws", "amazon web services"],
    "azure": ["azure", "microsoft azure"],
    "gcp": ["gcp", "google cloud", "google cloud platform"],
    "terraform": ["terraform", "iac", "infrastructure as code"],
    "ci/cd": ["ci/cd", "cicd", "continuous integration", "github actions", "gitlab ci", "jenkins"],
    "machine learning": ["machine learning", "ml", "supervised learning", "unsupervised learning"],
    "deep learning": ["deep learning", "dl", "neural networks", "cnn", "rnn"],
    "pytorch": ["pytorch", "torch"],
    "tensorflow": ["tensorflow", "tf", "keras"],
    "scikit-learn": ["scikit-learn", "sklearn"],
    "pandas": ["pandas"],
    "numpy": ["numpy"],
    "nlp": ["nlp", "natural language processing", "text processing"],
    "llm": ["llm", "large language models", "generative ai", "genai"],
    "gemini api": ["gemini", "gemini api", "google gemini"],
    "openai": ["openai", "chatgpt", "gpt-4", "gpt-3.5"],
    "langchain": ["langchain", "llamaindex", "rag", "retrieval augmented generation"],
    "rag": ["rag", "retrieval augmented generation", "vector search"],
    "vector db": ["vector db", "vector database", "chromadb", "pinecone", "qdrant", "weaviate"],
    "rest apis": ["rest apis", "rest api", "restful", "restful api", "api development"],
    "microservices": ["microservices", "microservice architecture"],
    "celery": ["celery", "distributed task queue"],
    "rabbitmq": ["rabbitmq", "message broker", "kafka"],
    "selenium": ["selenium", "playwright", "test automation"],
    "pytest": ["pytest", "unit testing", "unittest"],
    "git": ["git", "github", "gitlab"],
    "linux": ["linux", "unix", "bash", "shell scripting"],
    "tailwind css": ["tailwind css", "tailwind", "css3"],
    "system design": ["system design", "distributed systems", "software architecture"]
}

def normalize_skill(skill: str) -> str:
    s_clean = skill.strip().lower()
    for canonical, syns in SKILL_SYNONYMS.items():
        if s_clean == canonical or s_clean in syns:
            return canonical
    return s_clean

# ----------------- TF-IDF & Cosine Text Similarity -----------------

STOPWORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't",
    "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by",
    "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't",
    "down", "during", "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have",
    "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself", "him",
    "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't",
    "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself", "no", "nor",
    "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out",
    "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some",
    "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there",
    "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through", "to",
    "too", "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were",
    "weren't", "what", "what's", "when", "when's", "where", "where's", "which", "while", "who", "who's",
    "whom", "why", "why's", "with", "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're",
    "you've", "your", "yours", "yourself", "yourselves", "looking", "candidate", "responsibilities", "experience"
}

def tokenize(text: str) -> List[str]:
    tokens = re.findall(r"\b[a-zA-Z0-9_#+.-]{2,}\b", text.lower())
    return [t for t in tokens if t not in STOPWORDS]

def compute_tf_idf_similarity(text1: str, text2: str) -> float:
    tokens1 = tokenize(text1)
    tokens2 = tokenize(text2)
    if not tokens1 or not tokens2:
        return 0.0

    counts1 = Counter(tokens1)
    counts2 = Counter(tokens2)
    
    all_vocab = set(counts1.keys()).union(set(counts2.keys()))
    
    dot_product = 0.0
    norm1 = 0.0
    norm2 = 0.0
    
    for word in all_vocab:
        c1 = counts1.get(word, 0)
        c2 = counts2.get(word, 0)
        dot_product += c1 * c2
        norm1 += c1 * c1
        norm2 += c2 * c2

    if norm1 == 0 or norm2 == 0:
        return 0.0

    cosine = dot_product / (math.sqrt(norm1) * math.sqrt(norm2))
    # Scale smoothly between 0 and 100
    return min(100.0, max(0.0, cosine * 135.0))

# ----------------- Experience Alignment Calculation -----------------

def calculate_experience_fit(candidate_years_str: str, candidate_seniority: str, required_level: str, min_exp_years: float = 0.0) -> float:
    try:
        cand_exp = float(str(candidate_years_str).strip())
    except Exception:
        cand_exp = 1.0

    req_level_lower = required_level.lower()
    
    target_min = 0.0
    target_max = 20.0

    if "fresher" in req_level_lower:
        target_min, target_max = 0.0, 1.5
    elif "junior" in req_level_lower:
        target_min, target_max = 1.0, 3.0
    elif "mid" in req_level_lower:
        target_min, target_max = 3.0, 6.0
    elif "senior" in req_level_lower or "lead" in req_level_lower:
        target_min, target_max = 6.0, 15.0
    
    if min_exp_years > 0:
        target_min = max(target_min, min_exp_years)

    # Calculate fit
    if target_min <= cand_exp <= target_max:
        return 98.0
    elif cand_exp < target_min:
        deficit = target_min - cand_exp
        return max(35.0, 95.0 - (deficit * 18.0))
    else: # cand_exp > target_max (overqualified slightly)
        surplus = cand_exp - target_max
        return max(60.0, 95.0 - (surplus * 6.0))

# ----------------- Skill Intersection -----------------

def calculate_skill_intersection(candidate_skills_str: str, candidate_resume_text: str, required_skills: List[str]):
    if not required_skills:
        return 100.0, [], []

    cand_skills_raw = [s.strip() for s in candidate_skills_str.split(",") if s.strip()]
    cand_norm_skills = {normalize_skill(s) for s in cand_skills_raw}
    resume_lower = candidate_resume_text.lower()

    matched = []
    missing = []

    for req in required_skills:
        norm_req = normalize_skill(req)
        synonyms = SKILL_SYNONYMS.get(norm_req, [norm_req])
        
        # Check in normalized skills or anywhere in resume
        is_matched = False
        if norm_req in cand_norm_skills:
            is_matched = True
        else:
            for syn in synonyms:
                pattern = r"(?i)(^|[^a-zA-Z0-9_#+])" + re.escape(syn) + r"($|[^a-zA-Z0-9_#+])"
                if re.search(pattern, resume_lower):
                    is_matched = True
                    break

        if is_matched:
            matched.append(req)
        else:
            missing.append(req)

    coverage = (len(matched) / len(required_skills)) * 100.0
    return round(coverage, 1), matched, missing

# ----------------- Project Relevance & Domain Match -----------------

def calculate_project_relevance(candidate_projects: str, job_title: str, required_skills: List[str]) -> float:
    if not candidate_projects:
        return 50.0
    
    proj_lower = candidate_projects.lower()
    matches = 0
    total_checks = max(1, len(required_skills))

    for s in required_skills:
        if s.lower() in proj_lower:
            matches += 1
            
    title_words = [w.lower() for w in job_title.split() if len(w) > 3]
    for tw in title_words:
        if tw in proj_lower:
            matches += 1.5

    score = min(98.0, max(40.0, (matches / (total_checks + len(title_words))) * 120.0 + 35.0))
    return round(score, 1)

# ----------------- Tailored Interview Questions Generator -----------------

def generate_interview_questions(candidate_name: str, target_role: str, matched_skills: List[str], missing_skills: List[str], projects: str) -> List[str]:
    questions = []
    
    # Question 1: Focused on primary matched tech skill and project implementation
    primary_skill = matched_skills[0] if matched_skills else "Python"
    second_skill = matched_skills[1] if len(matched_skills) > 1 else "REST APIs"
    questions.append(
        f"Can you explain how you designed and deployed {primary_skill} & {second_skill} in your recent project, and how you handled high throughput or scalability?"
    )

    # Question 2: Probing missing skills or gap areas
    if missing_skills:
        missing_s = missing_skills[0]
        questions.append(
            f"This vacancy requires strong hands-on familiarity with {missing_s}. While your resume highlights {primary_skill}, how quickly can you ramp up on {missing_s}, and have you worked with similar tooling?"
        )
    else:
        questions.append(
            f"Walk us through a critical production bug or performance bottleneck in your {primary_skill} architecture. How did you diagnose and resolve it under deadline pressure?"
        )

    # Question 3: Architecture / Best Practices / Real-world project inquiry
    questions.append(
        f"Regarding your project '{projects.split('|')[0].strip() if '|' in projects else projects[:60]}...': What architectural trade-offs did you make during development, and what would you improve today?"
    )

    return questions

# ----------------- Selection Rationale Generator -----------------

def generate_selection_rationale(rank: int, cand_name: str, score: int, exp_years: str, seniority: str, matched_skills: List[str], missing_skills: List[str]) -> str:
    matched_str = ", ".join(matched_skills[:4]) if matched_skills else "core requirements"
    gap_str = f"with minor ramp-up needed on {missing_skills[0]}" if missing_skills else "with zero critical technical gaps"
    
    if rank == 1:
        return f"Ranked #1 overall candidate: Outstanding {score}% compatibility, offering {exp_years} yrs proven experience ({seniority}) with deep mastery across {matched_str}, {gap_str}."
    elif rank == 2:
        return f"Ranked #2 finalist: Excellent technical fit ({score}%) with strong hands-on experience in {matched_str}. Demonstrates high project relevance and solid engineering foundation."
    elif rank == 3:
        return f"Ranked #3 finalist: Strong hire recommendation ({score}%) with {exp_years} years in relevant domains. High proficiency in {matched_str}, presenting an ideal balance of experience and skill."
    elif rank == 4:
        return f"Ranked #4 finalist: Solid candidate profile ({score}%) exhibiting required competencies in {matched_str}. Good candidate for technical round with targeted questions on system design."
    else:
        return f"Ranked #5 finalist: Competent finalist ({score}%) meeting core vacancy criteria in {matched_str}, rounding out the Top 5 interview pool."

# ----------------- Main 2-Stage BML Funnel Engine -----------------

def run_bml_shortlisting_funnel(
    candidates_list: List[Dict[str, Any]],
    job_title: str,
    required_skills: List[str],
    experience_level: str = "Mid-Level",
    min_experience_years: float = 0.0,
    job_description: str = "",
    vacancy_count: int = 1
) -> Dict[str, Any]:
    """
    Executes the 2-Stage HR Shortlisting Funnel:
    - Stage 1: Evaluates all candidates across the database (150+) to pick the Top 10 Shortlist.
    - Stage 2: Deep multi-dimensional evaluation of the Top 10 to extract the Top 5 Finalists for interviews.
    """
    
    scored_candidates = []

    for cand in candidates_list:
        cand_id = cand.get("id") or cand.get("resume_id")
        cand_name = cand.get("candidate_name", "Candidate")
        skills_str = cand.get("skills", "")
        resume_text = cand.get("resume_text", "")
        exp_years_str = str(cand.get("total_experience_years", "1.0"))
        seniority = cand.get("seniority_level", "Mid-Level")
        projects = cand.get("projects", "")
        location = cand.get("location", "")
        email = cand.get("email", "")
        phone = cand.get("phone", "")
        target_role = cand.get("target_job_title", "")
        education = cand.get("education", "")

        # 1. Skill coverage (0-100)
        skill_coverage, matched_skills, missing_skills = calculate_skill_intersection(
            skills_str, resume_text, required_skills
        )

        # 2. Textual TF-IDF Similarity (0-100)
        combined_jd = f"{job_title} {' '.join(required_skills)} {job_description}"
        tfidf_score = compute_tf_idf_similarity(combined_jd, resume_text)

        # 3. Experience fit (0-100)
        exp_fit = calculate_experience_fit(exp_years_str, seniority, experience_level, min_experience_years)

        # Stage 1 Score Formula (50% Skills, 30% Semantic/Text, 20% Experience)
        stage1_score = (skill_coverage * 0.50) + (tfidf_score * 0.30) + (exp_fit * 0.20)
        stage1_score = min(98.0, max(25.0, stage1_score))

        scored_candidates.append({
            "candidate_id": cand_id,
            "candidate_name": cand_name,
            "email": email,
            "phone": phone,
            "location": location,
            "target_job_title": target_role,
            "seniority_level": seniority,
            "total_experience_years": exp_years_str,
            "education": education,
            "skills": skills_str,
            "projects": projects,
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "skill_match_pct": round(skill_coverage, 1),
            "experience_fit_pct": round(exp_fit, 1),
            "semantic_fit_pct": round(tfidf_score, 1),
            "stage1_score": round(stage1_score, 1)
        })

    # Sort all candidates by Stage 1 Score descending
    scored_candidates.sort(key=lambda x: x["stage1_score"], reverse=True)

    # ----------------- STAGE 1: Top 10 Shortlist -----------------
    top_10 = scored_candidates[:10]
    for idx, c in enumerate(top_10):
        c["stage1_rank"] = idx + 1
        c["overall_score"] = round(c["stage1_score"])

    # ----------------- STAGE 2: Top 5 Finalist Selection -----------------
    # Deep dimensional evaluation across Top 10 candidates
    stage2_evaluated = []
    for c in top_10:
        proj_score = calculate_project_relevance(c["projects"], job_title, required_skills)
        
        # 4 Dimensions:
        # Technical Skill Depth (40%)
        # Project & Domain Alignment (25%)
        # Experience & Seniority Fit (20%)
        # Semantic & Resume Quality (15%)
        final_bml_score = (
            (c["skill_match_pct"] * 0.40) +
            (proj_score * 0.25) +
            (c["experience_fit_pct"] * 0.20) +
            (c["semantic_fit_pct"] * 0.15)
        )
        final_bml_score = min(99.0, max(40.0, final_bml_score))

        c_copy = dict(c)
        c_copy["project_relevance_pct"] = round(proj_score, 1)
        c_copy["final_bml_score"] = round(final_bml_score, 1)
        stage2_evaluated.append(c_copy)

    # Sort Top 10 by Final BML Score descending and pick Top 5
    stage2_evaluated.sort(key=lambda x: x["final_bml_score"], reverse=True)
    top_5 = stage2_evaluated[:5]

    badges = [
        "Primary Selection (#1 Top Fit)",
        "Interview Priority (Strong Tech Depth)",
        "High Potential (Strong Experience Fit)",
        "Recommended Finalist (Balanced Match)",
        "Interview Ready (Solid Contender)"
    ]

    for idx, finalist in enumerate(top_5):
        finalist["finalist_rank"] = idx + 1
        finalist["hiring_badge"] = badges[idx]
        finalist["selection_rationale"] = generate_selection_rationale(
            rank=idx + 1,
            cand_name=finalist["candidate_name"],
            score=round(finalist["final_bml_score"]),
            exp_years=finalist["total_experience_years"],
            seniority=finalist["seniority_level"],
            matched_skills=finalist["matched_skills"],
            missing_skills=finalist["missing_skills"]
        )
        finalist["tailored_interview_questions"] = generate_interview_questions(
            candidate_name=finalist["candidate_name"],
            target_role=job_title,
            matched_skills=finalist["matched_skills"],
            missing_skills=finalist["missing_skills"],
            projects=finalist["projects"]
        )

    return {
        "job_summary": {
            "title": job_title,
            "required_skills": required_skills,
            "experience_level": experience_level,
            "vacancy_count": vacancy_count,
            "description": job_description
        },
        "funnel_stats": {
            "total_candidates_scanned": len(candidates_list),
            "stage1_shortlisted_count": len(top_10),
            "stage2_finalists_count": len(top_5)
        },
        "stage1_top10": top_10,
        "stage2_top5": top_5
    }
