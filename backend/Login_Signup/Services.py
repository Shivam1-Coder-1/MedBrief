import requests
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

def func_workout(level, exercise_type=None):
    url = "https://api.api-ninjas.com/v1/exercises"
    
    if not settings.API_NINJAS_KEY:
        logger.error("API_NINJAS_KEY is not set in settings")
        return {"success": False, "msg": "API key not configured"}
    
    headers = {"X-Api-Key": settings.API_NINJAS_KEY}
    
    params = {
        "difficulty": level,
    }
    
    if exercise_type:
        params["type"] = exercise_type
    
    logger.info(f"Requesting exercises: {params}")
    
    try:
        res = requests.get(url, headers=headers, params=params, timeout=8)
        logger.info(f"API Response Status: {res.status_code}")
        
        if res.status_code == 401:
            logger.error("Invalid API key")
            return {"success": False, "msg": "Invalid API credentials"}
        
        if res.status_code == 429:
            logger.error("Rate limit exceeded")
            return {"success": False, "msg": "API rate limit exceeded. Try again later."}
        
        res.raise_for_status()
        data = res.json()
        
        if not data:
            logger.warning(f"No exercises found for {params}")
            return {
                "success": False,
                "msg": f"No exercises found for difficulty '{level}'" + (f" and type '{exercise_type}'" if exercise_type else ""),
            }
        
        return {"success": True, "data": data}
    
    except requests.exceptions.HTTPError as e:
        logger.error(f"API Ninjas HTTP Error: {e.response.status_code} - {e.response.text}")
        return {"success": False, "msg": f"Exercise API error: {e.response.status_code}"}
    
    except requests.exceptions.RequestException as e:
        logger.error(f"Network Error: {str(e)}")
        return {"success": False, "msg": "Failed to connect to exercise service."}


def diet_by_bmi(bmi):
    if not settings.API_NINJAS_KEY:
        logger.error("API_NINJAS_KEY is not set in settings")
        return {"success": False, "msg": "API key not configured"}
    
    if bmi < 18.5:
        query, goal = "rice banana peanut butter milk", "High calorie diet"
    elif bmi < 25:
        query, goal = "chicken breast rice vegetables fruits", "Balanced diet"
    else:
        query, goal = "salad oats apple eggs", "Low calorie diet"
    
    url = "https://api.api-ninjas.com/v1/nutrition"
    headers = {"X-Api-Key": settings.API_NINJAS_KEY}
    
    try:
        res = requests.get(url, headers=headers, params={"query": query}, timeout=8)
        res.raise_for_status()
        
        return {
            "success": True,
            "data": {
                "goal": goal,
                "bmi": bmi,
                "foods": res.json(),
            },
        }
    
    except requests.exceptions.RequestException as e:
        logger.error(f"Diet API Failure: {str(e)}")
        return {"success": False, "msg": "Nutrition service currently unavailable."}