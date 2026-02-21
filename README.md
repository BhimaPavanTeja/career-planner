# Career Matcher

Simple React app (Vite) that accepts resume text and returns job matches using a client-side TF-IDF matcher.

Quick start

1. Install dependencies:

```bash
npm install
```

2. Run dev server:

```bash
npm run dev
```

Then open the URL shown by Vite (usually http://localhost:5173).

Backend (FastAPI)

1. Create a Python virtualenv and install backend deps:

```bash
python -m venv .venv
source .venv/Scripts/activate    # Windows: .venv\Scripts\activate
pip install -r backend/requirements.txt
```

2. Run the API:

```bash
uvicorn backend.main:app --reload --port 8000
```

The frontend calls `http://localhost:8000/match`. POST JSON `{ "resume": "...", "top_n": 3 }` to receive matches.

File upload (PDF)

The backend also supports uploading a PDF directly. POST a multipart form to `/match-file` with field `file` (PDF) and optional `top_n`.

Example using `curl`:

```bash
curl -F "file=@resume.pdf;type=application/pdf" -F "top_n=3" http://localhost:8000/match-file
```

Files of interest:
- [src/App.jsx](src/App.jsx)
- [src/matcher.js](src/matcher.js)
