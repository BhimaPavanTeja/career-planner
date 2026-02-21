from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re

JOB_DATA = [
    {"job_title": "Frontend Developer", "skills": "HTML CSS JavaScript React UI UX responsive design"},
    {"job_title": "Backend Developer", "skills": "Node.js Express MongoDB SQL API authentication"},
    {"job_title": "Data Scientist", "skills": "Python Machine Learning Pandas NumPy Statistics Deep Learning"},
    {"job_title": "AI Engineer", "skills": "Python NLP TensorFlow PyTorch Machine Learning Deep Learning"},
    {"job_title": "DevOps Engineer", "skills": "Docker Kubernetes CI/CD AWS Azure Jenkins Terraform"},
    {"job_title": "Mobile Developer", "skills": "Java Kotlin Swift Flutter React Native Android iOS" },
    {"job_title": "Cybersecurity Analyst", "skills": "Network Security Penetration Testing Vulnerability Assessment SIEM Incident Response" },
    {"job_title": "Cloud Architect", "skills": "AWS Azure Google Cloud Cloud Architecture Cloud Security Cloud Migration DevOps" },
    {"job_title": "Product Manager", "skills": "Product Strategy Roadmap Prioritization User Research Agile Scrum Stakeholder Management" },
    {"job_title": "UX Designer", "skills": "User Research Wireframing Prototyping Usability Testing Interaction Design Visual Design Figma Sketch Adobe XD" },
    {"job_title": "QA Engineer", "skills": "Test Automation Selenium JUnit TestNG Performance Testing API Testing Continuous Integration" },
    {"job_title": "Database Administrator", "skills": "SQL Database Management Performance Tuning Backup Recovery Security MySQL PostgreSQL MongoDB" }
]

def preprocess(text: str) -> str:
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r'[^a-z\s]', ' ', text)
    tokens = [t for t in text.split() if t]
    return " ".join(tokens)

class Matcher:
    def __init__(self, jobs=JOB_DATA):
        self.jobs = [{"job_title": j["job_title"], "skills": j["skills"], "processed": preprocess(j["skills"]) } for j in jobs]
        self.vectorizer = TfidfVectorizer()
        self._fit()

    def _fit(self):
        documents = [j["processed"] for j in self.jobs]
        if documents:
            self.tfidf_matrix = self.vectorizer.fit_transform(documents)
        else:
            self.tfidf_matrix = None

    def match(self, resume_text: str, top_n: int = 3):
        proc = preprocess(resume_text)
        if not proc.strip() or self.tfidf_matrix is None:
            return {"top": [], "missing": []}

        resume_vec = self.vectorizer.transform([proc])
        sims = cosine_similarity(resume_vec, self.tfidf_matrix).flatten()
        results = []
        for i, j in enumerate(self.jobs):
            results.append({"job_title": j["job_title"], "skills": j["skills"], "score": float(sims[i])})
        results.sort(key=lambda r: r["score"], reverse=True)
        top = results[:top_n]

        resume_set = set(proc.split())
        missing = []
        if top:
            top_skills = [s for s in re.sub(r'[^a-z\s]', ' ', top[0]["skills"].lower()).split() if s]
            missing = [s for s in top_skills if s not in resume_set]

        return {"top": top, "missing": missing}

