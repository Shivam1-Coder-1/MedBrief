import re

QUALITATIVE_TESTS = {
    "urine_sugar": ["urine sugar", "sugar"],
    "hiv": ["hiv"],
    "hbsag": ["hbsag", "australia antigen"],
    "vdrl": ["vdrl"]
}

VALUES = ["positive", "negative", "present", "absent", "non reactive", "reactive"]

def extract_qualitative(text: str) -> dict:
    results = {}

    for test, keywords in QUALITATIVE_TESTS.items():
        for kw in keywords:
            pattern = rf"{kw}[^a-z]{{0,20}}({'|'.join(VALUES)})"
            match = re.search(pattern, text)
            if match:
                results[test] = match.group(1)
                break

    return results
