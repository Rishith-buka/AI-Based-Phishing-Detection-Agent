# PhishGuard AI

A simple phishing detection MVP built with FastAPI and React.

## Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

## API

- Root: http://127.0.0.1:8000/
- Health: http://127.0.0.1:8000/health
- Analyze: http://127.0.0.1:8000/api/analyze-url

## Notes

This project analyzes URL indicators and scores phishing risk without actually visiting the target site.
