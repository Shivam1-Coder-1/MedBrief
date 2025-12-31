import re


def extract_patient_details(text: str) -> dict:

    if not text:
        return {}

    patterns = {
        "patient_id": [
            r"Patient\s*ID\s*[:\-]\s*([A-Za-z0-9\-]+)",
            r"UHID\s*[:\-]\s*([A-Za-z0-9\-]+)",
        ],
        "age": [
            r"Age\s*[:\-]\s*(\d{1,3})",
            r"(\d{1,3})\s*Years",
        ],
        "gender": [
            r"Gender\s*[:\-]\s*(Male|Female|Other)",
            r"Sex\s*[:\-]\s*(Male|Female|M|F)",
        ],
        "blood_group": [
            r"Blood\s*Group\s*[:\-]\s*(A\+|A\-|B\+|B\-|AB\+|AB\-|O\+|O\-)",
            r"Blood\s*Group\s*[:\-]\s*(A|B|AB|O)\s*(Positive|Negative)",
        ],
        "report_date": [
            r"Report\s*Date\s*[:\-]\s*([0-9\-\/]+)",
            r"Date\s*[:\-]\s*([0-9\-\/]+)",
        ],
    }

    extracted = {}

    for field, regex_list in patterns.items():
        value = "Not Available"

        for pattern in regex_list:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                value = match.group(1)
                break

        extracted[field] = normalize_field(field, value)

    return extracted


def normalize_field(field: str, value: str) -> str:
    if value == "Not Available":
        return value

    value = value.strip()

    if field == "gender":
        if value.lower() in ["m", "male"]:
            return "Male"
        if value.lower() in ["f", "female"]:
            return "Female"

    if field == "blood_group":
        value = value.replace("Positive", "+").replace("Negative", "-")

    return value
