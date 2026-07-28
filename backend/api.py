from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import shutil
import os
import uuid
from typing import List
from datetime import date
from . import models, schemas, database, ai_utils

router = APIRouter()

# Dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- AI Quote ---
@router.get("/api/quote")
def get_daily_quote():
    quote = ai_utils.generate_daily_quote()
    return {"quote": quote}

# --- Creative Challenge ---
@router.get("/api/challenge")
def get_daily_challenge():
    challenge = ai_utils.get_creative_challenge()
    return {"challenge": challenge}

# --- Diary ---
@router.post("/api/diary", response_model=schemas.DiaryEntryResponse)
def create_diary_entry(entry: schemas.DiaryEntryCreate, db: Session = Depends(get_db)):
    summary, mood = ai_utils.summarize_diary_entry(entry.content)
    
    import datetime
    entry_date = datetime.date.fromisoformat(entry.date) if entry.date else datetime.date.today()
    
    db_entry = models.DiaryEntry(
        date=entry_date,
        content=entry.content,
        mood=mood,
        summary=summary,
        image_path=entry.image_path
    )
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

@router.get("/api/streak")
def get_streak(db: Session = Depends(get_db)):
    trackers = db.query(models.DailyTracker).order_by(models.DailyTracker.date.desc()).all()
    if not trackers: return {"streak": 0}
    
    streak = 0
    import datetime
    current_date = datetime.date.today()
    if trackers[0].date != current_date and trackers[0].date != current_date - datetime.timedelta(days=1):
        return {"streak": 0}
        
    expected_date = trackers[0].date
    for t in trackers:
        if t.date == expected_date:
            streak += 1
            expected_date -= datetime.timedelta(days=1)
        else:
            break
            
    return {"streak": streak}

@router.post("/api/upload")
async def upload_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    extension = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{extension}"
    file_path = os.path.join(os.path.dirname(__file__), "uploads", filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {"image_path": f"/uploads/{filename}"}

@router.get("/api/diary", response_model=List[schemas.DiaryEntryResponse])
def get_diary_entries(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return db.query(models.DiaryEntry).order_by(models.DiaryEntry.date.desc()).offset(skip).limit(limit).all()

# --- Study Planner ---
@router.post("/api/planner", response_model=schemas.StudyPlanResponse)
def create_study_plan(plan: schemas.StudyPlanCreate, db: Session = Depends(get_db)):
    plan_text = ai_utils.generate_study_plan(plan.subjects, str(plan.exam_date))
    db_plan = models.StudyPlan(
        subjects=plan.subjects,
        exam_date=plan.exam_date,
        plan_text=plan_text
    )
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan

@router.get("/api/planner", response_model=List[schemas.StudyPlanResponse])
def get_study_plans(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return db.query(models.StudyPlan).order_by(models.StudyPlan.exam_date.asc()).offset(skip).limit(limit).all()

# --- Expenses ---
@router.post("/api/expenses", response_model=schemas.ExpenseResponse)
def create_expense(expense: schemas.ExpenseCreate, db: Session = Depends(get_db)):
    db_expense = models.Expense(**expense.dict())
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense

@router.get("/api/expenses", response_model=List[schemas.ExpenseResponse])
def get_expenses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Expense).order_by(models.Expense.date.desc()).offset(skip).limit(limit).all()

# --- Daily Tracker ---
@router.post("/api/tracker", response_model=schemas.DailyTrackerResponse)
def update_tracker(tracker: schemas.DailyTrackerCreate, db: Session = Depends(get_db)):
    db_tracker = db.query(models.DailyTracker).filter(models.DailyTracker.date == tracker.date).first()
    if db_tracker:
        for key, value in tracker.dict().items():
            setattr(db_tracker, key, value)
    else:
        db_tracker = models.DailyTracker(**tracker.dict())
        db.add(db_tracker)
    db.commit()
    db.refresh(db_tracker)
    return db_tracker

@router.get("/api/tracker/{tracker_date}", response_model=schemas.DailyTrackerResponse)
def get_tracker(tracker_date: date, db: Session = Depends(get_db)):
    db_tracker = db.query(models.DailyTracker).filter(models.DailyTracker.date == tracker_date).first()
    if not db_tracker:
        raise HTTPException(status_code=404, detail="Tracker not found for this date")
    return db_tracker

# --- Completed Challenges ---
@router.post("/api/completed_challenge", response_model=schemas.ChallengeEntryResponse)
def save_completed_challenge(challenge: schemas.ChallengeEntryCreate, db: Session = Depends(get_db)):
    import datetime
    db_challenge = models.ChallengeEntry(
        date=datetime.date.today(),
        challenge_text=challenge.challenge_text,
        response_text=challenge.response_text
    )
    db.add(db_challenge)
    db.commit()
    db.refresh(db_challenge)
    return db_challenge

@router.get("/api/completed_challenges", response_model=List[schemas.ChallengeEntryResponse])
def get_completed_challenges(db: Session = Depends(get_db)):
    return db.query(models.ChallengeEntry).order_by(models.ChallengeEntry.date.desc()).all()
