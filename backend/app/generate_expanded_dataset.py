import csv
import os
import random

# Fixed seed for deterministic, high quality generation
random.seed(42)

FIRST_NAMES = [
    "Aarav", "Vivaan", "Aditya", "Arjun", "Rahul", "Rohan", "Kunal", "Ayush", "Ankit", "Nikhil",
    "Priya", "Ananya", "Sneha", "Isha", "Pooja", "Neha", "Divya", "Tanvi", "Meera", "Shreya",
    "Vikram", "Abhishek", "Harsh", "Varun", "Gaurav", "Siddharth", "Pranav", "Kartik", "Deepak", "Amit",
    "Kavita", "Ritu", "Swati", "Simran", "Aarti", "Bhavna", "Kriti", "Akanksha", "Preeti", "Sonal",
    "Manish", "Yash", "Rajat", "Alok", "Sameer", "Tarun", "Mayank", "Naveen", "Ashish", "Sachin",
    "Shubham", "Tushar", "Suraj", "Akash", "Mohit", "Pankaj", "Vikas", "Ramesh", "Suresh", "Dinesh",
    "Kajal", "Monika", "Pallavi", "Shalini", "Sunita", "Vandana", "Garima", "Geetanjali", "Payal", "Radhika"
]

LAST_NAMES = [
    "Sharma", "Verma", "Singh", "Kumar", "Mehta", "Gupta", "Patel", "Yadav", "Jain", "Chopra",
    "Reddy", "Nair", "Iyer", "Banerjee", "Chatterjee", "Mishra", "Pandey", "Saxena", "Bhatia", "Malhotra",
    "Kapoor", "Bhatt", "Deshmukh", "Kulkarni", "Patil", "Pawar", "Joshi", "Choudhary", "Rathore", "Agarwal"
]

CITIES = [
    "Bengaluru, Karnataka", "Gurugram, Haryana", "Noida, Uttar Pradesh", "Hyderabad, Telangana",
    "Pune, Maharashtra", "Delhi, India", "Mumbai, Maharashtra", "Chennai, Tamil Nadu",
    "Kolkata, West Bengal", "Jaipur, Rajasthan", "Ahmedabad, Gujarat", "Chandigarh, India"
]

DEGREES = [
    "B.Tech in Computer Science & Engineering",
    "B.E. in Information Technology",
    "M.Tech in Computer Science & Engineering",
    "M.Tech in Artificial Intelligence",
    "Master of Computer Applications (MCA)",
    "B.Sc in Computer Science",
    "B.Tech in Electronics & Communication",
    "M.S. in Data Science & Machine Learning"
]

ROLE_TEMPLATES = [
    {
        "role": "Python Developer",
        "category": "Backend",
        "core_skills": ["Python", "FastAPI", "Django", "REST APIs", "PostgreSQL", "Git", "Docker"],
        "extra_pool": ["Redis", "Celery", "RabbitMQ", "PyTest", "SQLAlchemy", "Linux", "AWS", "CI/CD"],
        "project_templates": [
            "High-throughput REST API gateway with FastAPI & PostgreSQL handling 15k req/min",
            "Distributed task scheduling pipeline using Celery, Redis, and Django ORM",
            "Microservices authentication and RBAC service deployed with Docker on AWS"
        ]
    },
    {
        "role": "AI/ML Engineer",
        "category": "AI/ML",
        "core_skills": ["Python", "Machine Learning", "Scikit-learn", "Pandas", "NumPy", "PyTorch"],
        "extra_pool": ["TensorFlow", "MLflow", "Hugging Face", "Deep Learning", "Docker", "FastAPI", "SQL"],
        "project_templates": [
            "Customer churn prediction and feature engineering pipeline achieving 91% ROC-AUC",
            "Automated document classification model fine-tuned using PyTorch and Scikit-learn",
            "Real-time fraud detection engine streaming predictions via FastAPI microservice"
        ]
    },
    {
        "role": "Generative AI & LLM Specialist",
        "category": "AI/ML",
        "core_skills": ["Python", "LangChain", "RAG", "Vector DB", "Gemini API", "OpenAI", "Embeddings"],
        "extra_pool": ["Hugging Face", "PyTorch", "FastAPI", "Docker", "Pinecone", "ChromaDB", "NLP"],
        "project_templates": [
            "Enterprise RAG assistant with hybrid retrieval over 50,000 corporate documents",
            "Autonomous multi-agent customer support bot built with LangChain and Gemini API",
            "Domain-specific LLM fine-tuning and quantization pipeline on Hugging Face"
        ]
    },
    {
        "role": "Full Stack Python Developer",
        "category": "Full Stack",
        "core_skills": ["Python", "FastAPI", "React", "JavaScript", "TypeScript", "PostgreSQL"],
        "extra_pool": ["Tailwind CSS", "Next.js", "Docker", "Redux", "REST APIs", "Git", "Node.js"],
        "project_templates": [
            "Full stack analytics dashboard with React 18, Tailwind CSS, and FastAPI backend",
            "E-commerce inventory and order management platform with PostgreSQL and Next.js",
            "Real-time collaboration SaaS tool with WebSocket support and responsive UI"
        ]
    },
    {
        "role": "Data Scientist",
        "category": "Data",
        "core_skills": ["Python", "Pandas", "NumPy", "SQL", "Scikit-learn", "Statistics", "Data Science"],
        "extra_pool": ["Tableau", "Power BI", "Matplotlib", "Seaborn", "PostgreSQL", "Machine Learning", "Airflow"],
        "project_templates": [
            "Exploratory data analysis and predictive revenue modeling across 2M transactions",
            "A/B testing experimentation framework and automated executive KPI dashboards",
            "Customer lifetime value (CLV) clustering model using K-Means and Random Forest"
        ]
    },
    {
        "role": "DevOps & Cloud Engineer",
        "category": "DevOps",
        "core_skills": ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform", "Linux", "Python"],
        "extra_pool": ["GitHub Actions", "Prometheus", "Grafana", "GitLab", "Bash", "Ansible", "GCP"],
        "project_templates": [
            "Automated multi-stage CI/CD pipeline reducing build and deployment latency by 65%",
            "Infrastructure-as-Code Terraform modules deploying secure Kubernetes clusters on AWS",
            "High-availability Prometheus and Grafana monitoring stack with alert manager"
        ]
    },
    {
        "role": "QA Automation Engineer",
        "category": "QA",
        "core_skills": ["Python", "Selenium", "PyTest", "REST APIs", "Postman", "CI/CD", "Git"],
        "extra_pool": ["Playwright", "Jenkins", "SQL", "Docker", "JIRA", "Agile", "Linux"],
        "project_templates": [
            "Automated test regression suite covering 300+ API and UI test flows with PyTest",
            "Continuous testing pipeline integrated into GitHub Actions with Slack reporting",
            "Performance and load testing framework simulating 5,000 concurrent user sessions"
        ]
    },
    {
        "role": "Senior Backend Architect",
        "category": "Backend",
        "core_skills": ["Python", "FastAPI", "Microservices", "PostgreSQL", "Redis", "Docker", "System Design"],
        "extra_pool": ["Kafka", "RabbitMQ", "Kubernetes", "AWS", "Elasticsearch", "CI/CD", "GraphQL"],
        "project_templates": [
            "Monolith to event-driven microservices migration handling 100M events/day",
            "Distributed caching and read-replica database optimization reducing P99 latency by 70%",
            "Fault-tolerant asynchronous billing and transaction service with idempotency keys"
        ]
    }
]

EXPERIENCE_LEVELS = [
    {"level": "Fresher", "min_exp": 0.2, "max_exp": 1.0, "leadership": "Academic team lead / Hackathon coordinator"},
    {"level": "Junior", "min_exp": 1.1, "max_exp": 2.8, "leadership": "Code reviews & sprint task estimation"},
    {"level": "Mid-Level", "min_exp": 3.0, "max_exp": 5.8, "leadership": "Led feature module development & mentored junior devs"},
    {"level": "Senior", "min_exp": 6.0, "max_exp": 11.5, "leadership": "Technical lead directing cross-functional architecture & hiring"}
]

def generate_candidates(target_count=150):
    candidates = []
    
    for i in range(1, target_count + 1):
        first_name = random.choice(FIRST_NAMES)
        last_name = random.choice(LAST_NAMES)
        full_name = f"{first_name} {last_name}"
        email = f"{first_name.lower()}.{last_name.lower()}{i:03d}@example.com"
        phone = f"+91-98{random.randint(100, 999)}-{random.randint(10000, 99999)}"
        location = random.choice(CITIES)
        degree = random.choice(DEGREES)
        
        role_info = ROLE_TEMPLATES[i % len(ROLE_TEMPLATES)]
        exp_info = EXPERIENCE_LEVELS[random.choices([0, 1, 2, 3], weights=[20, 30, 35, 15])[0]]
        
        exp_years = round(random.uniform(exp_info["min_exp"], exp_info["max_exp"]), 1)
        seniority = exp_info["level"]
        leadership = exp_info["leadership"]
        
        # Skills
        core = list(role_info["core_skills"])
        extras = random.sample(role_info["extra_pool"], k=min(4, len(role_info["extra_pool"])))
        all_skills = list(dict.fromkeys(core + extras))
        skills_str = ", ".join(all_skills)
        
        # Projects
        chosen_projects = random.sample(role_info["project_templates"], k=2)
        projects_str = " | ".join(chosen_projects)
        
        # Career summary
        summary = (
            f"Results-oriented {role_info['role']} ({seniority}) with {exp_years} years of proven experience "
            f"in {role_info['category']} engineering. Demonstrated expertise in {', '.join(all_skills[:4])}. "
            f"Passionate about writing clean, maintainable code and delivering scalable production systems."
        )
        
        # Complete resume text
        resume_text = (
            f"{full_name} | {email} | {phone} | {location}\n"
            f"Objective / Professional Summary:\n{summary}\n\n"
            f"Core Competencies & Technical Skills:\n{skills_str}\n\n"
            f"Work Experience & Leadership ({seniority} - {exp_years} Years):\n"
            f"- Role: {role_info['role']} ({exp_years} years total experience)\n"
            f"- Responsibilities: Built production features, handled requirements, conducted unit tests, collaborated in Agile sprints.\n"
            f"- Leadership: {leadership}\n\n"
            f"Key Technical Projects:\n"
            f"1. {chosen_projects[0]}\n"
            f"2. {chosen_projects[1]}\n\n"
            f"Education:\n- {degree}\n\n"
            f"Tools & Practices: Git, Agile/Scrum, CI/CD, Problem Solving, Clean Architecture."
        )
        
        candidates.append({
            "resume_id": i,
            "candidate_name": full_name,
            "email": email,
            "phone": phone,
            "location": location,
            "career_summary": summary,
            "total_experience_years": str(exp_years),
            "seniority_level": seniority,
            "target_job_title": role_info["role"],
            "functional_expertise": role_info["category"],
            "leadership": leadership,
            "education": degree,
            "capability_tags": skills_str,
            "skills": skills_str,
            "projects": projects_str,
            "resume_text": resume_text
        })
        
    return candidates

def write_csv(candidates, filepath):
    fieldnames = [
        "resume_id", "candidate_name", "email", "phone", "location",
        "career_summary", "total_experience_years", "seniority_level",
        "target_job_title", "functional_expertise", "leadership", "education",
        "capability_tags", "skills", "projects", "resume_text"
    ]
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(candidates)
    print(f"Successfully generated {len(candidates)} candidates at {filepath}")

if __name__ == "__main__":
    cands = generate_candidates(150)
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(os.path.dirname(current_dir))
    target_dir = os.path.join(project_root, "dataset")
    
    write_csv(cands, os.path.join(target_dir, "resumes.csv"))
    write_csv(cands, os.path.join(target_dir, "ai_resume_analyzer_100_resumes.csv"))
