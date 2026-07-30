import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini API
api_key = os.getenv("GEMINI_API_KEY", "")
if api_key == "your_google_gemini_api_key_here":
    api_key = ""

if api_key:
    genai.configure(api_key=api_key)
else:
    print("Warning: GEMINI_API_KEY not found in .env")

model = genai.GenerativeModel('gemini-2.5-flash') # Updated to latest working model

def generate_daily_quote() -> str:
    if not api_key: return "Discipline is the bridge between goals and accomplishment."
    try:
        response = model.generate_content("Generate a short, unique, and inspiring daily motivational quote for productivity and success. Return ONLY the quote text.")
        return response.text.strip().strip('"')
    except Exception as e:
        return f"Stay positive, work hard, make it happen."

def summarize_diary_entry(content: str):
    if not api_key: return f"Reflecting on: {content[:30]}...", "Thoughtful"
    try:
        prompt = f"Summarize this diary entry in one short sentence and determine the mood (e.g. Happy, Sad, Neutral, Excited, Anxious). Diary: {content}\n\nFormat your response EXACTLY like this:\nSummary: <summary>\nMood: <mood>"
        response = model.generate_content(prompt)
        text = response.text
        summary = text.split('Summary:')[1].split('Mood:')[0].strip()
        mood = text.split('Mood:')[1].strip()
        return summary, mood
    except Exception as e:
        print(f"Summarize error: {e}")
        return f"Error: {str(e)}", "Neutral"

def generate_study_plan(subject: str, topics: str, exam_date: str, hours_per_day: float = 2.0) -> str:
    if not api_key: return "[]"
    try:
        from datetime import datetime
        try:
            exam_d = datetime.strptime(exam_date, "%Y-%m-%d").date()
            today = datetime.now().date()
            days_left = max(1, (exam_d - today).days)
        except:
            days_left = 7 # fallback

        topics_prompt = f"\nSpecifically, ensure the study plan covers these topics: {topics}" if topics else ""

        prompt = f"""Create a highly optimized study timetable for '{subject}'.{topics_prompt}
The exam is exactly in {days_left} days.
The student can study {hours_per_day} hours per day.

You must return ONLY a raw JSON array representing the timeline (NO markdown, NO backticks).
Each object in the array must have these EXACT keys:
- "period" (string: e.g. 'Day 1', 'Day 1-2', 'Week 1' depending on the scale of days_left)
- "title" (string: specific topic to cover)
- "hours" (number: estimated hours to spend, total across the period should roughly match hours_per_day * days in period)
- "priority" (string: 'High', 'Medium', or 'Critical')
- "completed" (boolean: false)

Example for a 2-day gap:
[
  {{"period": "Day 1", "title": "Core Concepts Review", "hours": {hours_per_day}, "priority": "High", "completed": false}},
  {{"period": "Day 2", "title": "Mock Exams & Weaknesses", "hours": {hours_per_day}, "priority": "Critical", "completed": false}}
]

Output ONLY valid JSON.
"""
        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
        return text.strip()
    except Exception as e:
        print(f"Study Plan Error: {e}")
        return "[]"

def get_creative_challenge() -> str:
    if not api_key: return "Write down 3 things you are grateful for."
    try:
        response = model.generate_content("Give me one short, random creative challenge to do today. Example: 'Draw a tree', 'Sing a song'. Just return the challenge.")
        return response.text.strip()
    except Exception as e:
        return "Take a 5 minute mindful walk."
