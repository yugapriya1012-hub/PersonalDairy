from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models
from database import engine

# Create the database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="LifeOS AI API")

# Configure CORS so the frontend can communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development purposes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root route removed to allow static files to serve index.html

from api import router as api_router
from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    try:
        body = await request.body()
        print(f"Validation Error! Body: {body.decode()} - Error: {exc.errors()}")
    except:
        pass
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": exc.body},
    )

from fastapi.staticfiles import StaticFiles

app.include_router(api_router)

# Mount the frontend directory to serve static files (HTML, CSS, JS) if it exists
import os
frontend_path = os.path.join(os.path.dirname(__file__), "../frontend")
if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")
else:
    @app.get("/")
    def read_root():
        return {"status": "LifeOS API is running on Vercel!"}

# Create uploads directory and mount it
uploads_path = os.path.join(os.path.dirname(__file__), "uploads")
try:
    os.makedirs(uploads_path, exist_ok=True)
except OSError:
    # Fallback for serverless read-only environments
    uploads_path = "/tmp/uploads"
    os.makedirs(uploads_path, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=uploads_path), name="uploads")
