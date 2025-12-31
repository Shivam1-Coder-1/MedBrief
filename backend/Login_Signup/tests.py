from django.test import TestCase
from unittest.mock import patch
from .Services import func_workout, diet_by_bmi


class SmartHelpServiceTests(TestCase):

    @patch("reports.services.smart_help.requests.get")
    def test_func_workout_valid_level(self, mock_get):
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = [
            {"name": "Push Up", "difficulty": "beginner"}
        ]

        result = func_workout("Beginner")

        self.assertTrue(result["success"])
        self.assertIsInstance(result["data"], list)

    def test_func_workout_invalid_level(self):
        result = func_workout("superhard")

        self.assertFalse(result["success"])
        self.assertIn("Workout level", result["msg"])

    def test_func_workout_none_level(self):
        result = func_workout(None)

        self.assertFalse(result["success"])

    @patch("reports.services.smart_help.requests.get")
    def test_func_workout_empty_api_response(self, mock_get):
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = []

        result = func_workout("beginner")

        self.assertTrue(result["success"])
        self.assertEqual(result["data"], [])

    @patch("reports.services.smart_help.requests.get")
    def test_diet_by_bmi_valid(self, mock_get):
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = [
            {"name": "Rice", "calories": 200}
        ]

        result = diet_by_bmi(22.5)

        self.assertTrue(result["success"])
        self.assertEqual(result["data"]["goal"], "Balanced diet")

    def test_diet_by_bmi_invalid(self):
        result = diet_by_bmi("abc")

        self.assertFalse(result["success"])
        self.assertIn("Invalid BMI", result["msg"])

    def test_diet_by_bmi_negative(self):
        result = diet_by_bmi(-5)

        self.assertFalse(result["success"])
