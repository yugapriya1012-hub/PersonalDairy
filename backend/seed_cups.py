import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, ChampionCup, UserStreak

# Assuming SQLite for local development
SQLALCHEMY_DATABASE_URL = "sqlite:///./lifeos.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def seed():
    # Create the new tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # 1. Seed Champion Cups
    cups = [
        {"name": "bronze", "required_streak_days": 30, "required_points": 1000, "reward_badge": "🥉"},
        {"name": "silver", "required_streak_days": 60, "required_points": 2500, "reward_badge": "🥈"},
        {"name": "gold", "required_streak_days": 100, "required_points": 5000, "reward_badge": "🥇"},
        {"name": "champion", "required_streak_days": 365, "required_points": 10000, "reward_badge": "🏆"}
    ]
    
    for cup_data in cups:
        existing = db.query(ChampionCup).filter(ChampionCup.name == cup_data["name"]).first()
        if not existing:
            new_cup = ChampionCup(**cup_data)
            db.add(new_cup)
    
    # 2. Seed Initial User Streak (simulating the data we are recovering from LocalStorage)
    user_streak = db.query(UserStreak).first()
    if not user_streak:
        # Starting with the values from the user's LocalStorage session
        user_streak = UserStreak(
            current_streak=5,
            longest_streak=5,
            total_completed_days=5,
            points=390,
            champion_cup_status="locked",
            champion_cup_level="none",
            total_cups_earned=0
        )
        db.add(user_streak)
    
    db.commit()
    db.close()
    print("Database seeded successfully with Champion Cups and User Streak!")

if __name__ == "__main__":
    seed()
