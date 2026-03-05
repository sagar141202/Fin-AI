from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth

# Create all tables in PostgreSQL on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Fin-AI Backend", version="1.0.0")

# CORS — allows your React app (localhost:5173) to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)

@app.get("/")
def root():
    return {"message": "Fin-AI API is running ✅"}