from sqlalchemy import Column, Integer, String, Float, Date, DateTime
from datetime import datetime
from database import Base

class DiaryEntry(Base):
    __tablename__ = "diary_entries"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, index=True)
    content = Column(String)
    mood = Column(String)
    summary = Column(String)
    image_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    tags = Column(String, nullable=True)
    location = Column(String, nullable=True)
    weather = Column(String, nullable=True)
    ai_reflection = Column(String, nullable=True)
    audio_path = Column(String, nullable=True)

class StudyPlan(Base):
    __tablename__ = "study_plans"
    id = Column(Integer, primary_key=True, index=True)
    subjects = Column(String, index=True)
    exam_date = Column(Date)
    plan_text = Column(String) # AI generated plan
    created_at = Column(DateTime, default=datetime.utcnow)

class Expense(Base):
    __tablename__ = "expenses"
    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float)
    category = Column(String, index=True) # food, travel, etc.
    description = Column(String)
    date = Column(Date, index=True)

class DailyTracker(Base):
    __tablename__ = "daily_trackers"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, unique=True, index=True)
    study_hours = Column(Float, default=0.0)
    workout_minutes = Column(Integer, default=0)
    sleep_hours = Column(Float, default=0.0)
    water_glasses = Column(Integer, default=0)
    productivity_score = Column(Integer, default=5) # 1-10
    challenge_completed = Column(Integer, default=0) # boolean via integer 0/1

class EnglishWord(Base):
    __tablename__ = "english_words"
    id = Column(Integer, primary_key=True, index=True)
    word = Column(String, unique=True, index=True)
    pronunciation = Column(String)
    meaning = Column(String)
    synonyms = Column(String)
    antonyms = Column(String)
    example = Column(String)
    date_learned = Column(Date)

class ChallengeEntry(Base):
    __tablename__ = "challenge_entries"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, index=True)
    challenge_text = Column(String)
    response_text = Column(String)
