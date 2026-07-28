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

model = genai.GenerativeModel('gemini-1.5-flash') # Using flash for faster responses

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

def generate_study_plan(subject: str, exam_date: str) -> str:
    if not api_key: return "1. Review notes\n2. Practice problems\n3. Take breaks."
    try:
        prompt = f"Create a brief, effective study timetable for {subject} for an exam on {exam_date}. Give a concise list of steps."
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return "Focus on key concepts and practice past papers."

def get_creative_challenge() -> str:
    if not api_key: return "Write down 3 things you are grateful for."
    try:
        response = model.generate_content("Give me one short, random creative challenge to do today. Example: 'Draw a tree', 'Sing a song'. Just return the challenge.")
        return response.text.strip()
    except Exception as e:
        return "Take a 5 minute mindful walk."
