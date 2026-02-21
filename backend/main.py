from fastapi import FastAPI, File, UploadFile, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from backend.model import Matcher
from io import BytesIO
from pypdf import PdfReader

app = FastAPI(title="Career Matcher API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

matcher = Matcher()

class ResumeRequest(BaseModel):
    resume: str
    top_n: int = 3


@app.post("/match")
def match(req: ResumeRequest):
    return matcher.match(req.resume, req.top_n)


@app.post("/match-file")
async def match_file(file: UploadFile = File(...), top_n: int = 3):
    if not file.content_type or 'pdf' not in file.content_type.lower():
        raise HTTPException(status_code=400, detail='Only PDF files are supported')
    content = await file.read()
    try:
        reader = PdfReader(BytesIO(content))
        text = []
        for p in reader.pages:
            page_text = p.extract_text() or ''
            text.append(page_text)
        full_text = "\n".join(text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Failed to extract PDF text: {e}')

    return matcher.match(full_text, top_n)


if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000)
