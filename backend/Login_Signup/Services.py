import requests
import logging
from django.conf import settings

logger = logging.getLogger(__name__)


def func_workout(level, exercise_type=None):
    url = "https://api.api-ninjas.com/v1/exercises"

    if not settings.API_NINJAS_KEY:
        return {"success": False, "msg": "API key not configured"}

    headers = {"X-Api-Key": settings.API_NINJAS_KEY}
    params = {"difficulty": level}

    if exercise_type:
        params["type"] = exercise_type

    try:
        res = requests.get(url, headers=headers, params=params, timeout=8)

        if res.status_code == 401:
            return {"success": False, "msg": "Invalid API key"}

        if res.status_code == 429:
            return {"success": False, "msg": "Rate limit exceeded"}

        res.raise_for_status()
        data = res.json()

        if not data:
            return {"success": False, "msg": "No exercises found"}

        return {"success": True, "data": data}

    except requests.exceptions.RequestException as e:
        logger.error(f"Workout API error: {str(e)}")
        return {"success": False, "msg": "Workout service unavailable"}


def diet_by_bmi(bmi):
    if not settings.API_NINJAS_KEY:
        return {"success": False, "msg": "API key not configured"}

    if bmi < 18.5:
        query, goal = "1 banana, 2 tbsp peanut butter, 1 glass milk", "High calorie diet"
    elif bmi < 25:
        query, goal = "150g chicken breast, 1 cup rice, 1 apple", "Balanced diet"
    else:
        query, goal = "2 eggs, 1 apple, 50g oats", "Low calorie diet"

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
        logger.error(f"Diet API error: {str(e)}")
        return {"success": False, "msg": "Nutrition service unavailable"}