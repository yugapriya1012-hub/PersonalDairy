from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class DiaryEntryBase(BaseModel):
    content: str

class DiaryEntryCreate(DiaryEntryBase):
    date: Optional[str] = None
    image_path: Optional[str] = None
    mood: Optional[str] = None
    tags: Optional[str] = None
    location: Optional[str] = None
    weather: Optional[str] = None
    audio_path: Optional[str] = None

class DiaryEntryUpdate(BaseModel):
    content: Optional[str] = None
    date: Optional[date] = None
    mood: Optional[str] = None
    tags: Optional[str] = None
    location: Optional[str] = None
    weather: Optional[str] = None
    image_path: Optional[str] = None
    audio_path: Optional[str] = None

class DiaryEntryResponse(DiaryEntryBase):
    id: int
    date: date
    mood: Optional[str] = None
    summary: Optional[str] = None
    image_path: Optional[str] = None
    tags: Optional[str] = None
    location: Optional[str] = None
    weather: Optional[str] = None
    ai_reflection: Optional[str] = None
    audio_path: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class StudyPlanBase(BaseModel):
    subjects: str
    exam_date: date

class StudyPlanCreate(StudyPlanBase):
    pass

class StudyPlanResponse(StudyPlanBase):
    id: int
    plan_text: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class ExpenseBase(BaseModel):
    amount: float
    category: str
    description: Optional[str] = None
    date: date

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseResponse(ExpenseBase):
    id: int
    
    class Config:
        from_attributes = True

class DailyTrackerBase(BaseModel):
    date: date
    study_hours: Optional[float] = 0.0
    workout_minutes: Optional[int] = 0
    sleep_hours: Optional[float] = 0.0
    water_glasses: Optional[int] = 0
    productivity_score: Optional[int] = 5
    challenge_completed: Optional[bool] = False

class DailyTrackerCreate(DailyTrackerBase):
    pass

class DailyTrackerResponse(DailyTrackerBase):
    id: int
    
    class Config:
        from_attributes = True

class ChallengeResponse(BaseModel):
    description: str
    difficulty: str
    category: str

class EnglishWordResponse(BaseModel):
    id: Optional[int] = None
    word: str
    pronunciation: str
    meaning: str
    synonyms: str
    antonyms: str
    example: str
    date_learned: Optional[date] = None

    class Config:
        from_attributes = True

class PortfolioRequest(BaseModel):
    name: str
    profession: str
    bio: str
    theme: str

class PortfolioResponse(BaseModel):
    html_content: str

class ColorPaletteResponse(BaseModel):
    colors: list[str]
    rationale: str
    gradient_css: str

class ChallengeEntryCreate(BaseModel):
    challenge_text: str
    response_text: str

class ChallengeEntryResponse(ChallengeEntryCreate):
    id: int
    date: date
    
    class Config:
        from_attributes = True
