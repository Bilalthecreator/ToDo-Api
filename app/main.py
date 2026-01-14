from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from .database import engine, Base
from .routers import auth_routes, groups, tasks

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ToDo API",
    description="A task management API with user authentication and groups",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get the directory where main.py is located
BASE_DIR = Path(__file__).resolve().parent

# Mount static files (CSS, JS)
app.mount("/static", StaticFiles(directory=str(BASE_DIR / "static")), name="static")

# Setup templates (HTML)
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))

# Include API routers with /api prefix
app.include_router(auth_routes.router, prefix="/api")
app.include_router(groups.router, prefix="/api")
app.include_router(tasks.router, prefix="/api")

# Root route - serve the frontend HTML
@app.get("/")
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

# API info route
@app.get("/api")
def api_root():
    return {
        "message": "Welcome to ToDo API",
        "docs": "/docs",
        "version": "1.0.0"
    }

