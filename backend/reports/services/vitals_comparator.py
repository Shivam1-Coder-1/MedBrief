import re
from .normal_ranges import NORMAL_RANGES


def compare_vitals(vitals: dict, gender: str = None) -> list:
    """
    Compare extracted vitals with normal ranges and return structured results.
    Improved handling for SpO2 and Blood Sugar.
    """

    results = []

    for vital, raw_value in vitals.items():
        if vital not in NORMAL_RANGES or raw_value is None:
            continue

        normal = NORMAL_RANGES[vital]
        status = "Normal"

       
        if normal["type"] == "bp":
            match = re.search(r"(\d{2,3})\s*/\s*(\d{2,3})", str(raw_value))
            if not match:
                continue

            systolic = int(match.group(1))
            diastolic = int(match.group(2))

            if (
                systolic > normal["systolic_max"]
                or diastolic > normal["diastolic_max"]
            ):
                status = "High"

            results.append({
                "vital": "Blood Pressure",
                "patient_value": f"{systolic}/{diastolic}",
                "normal_range": f"≤{normal['systolic_max']} / ≤{normal['diastolic_max']}",
                "status": status,
            })
            continue

    
        if normal["type"] == "qualitative":
            value_lower = str(raw_value).lower().strip()
            status = (
                "Normal"
                if value_lower in normal.get("normal", [])
                else "Abnormal"
            )

            results.append({
                "vital": vital.replace("_", " ").title(),
                "patient_value": raw_value,
                "normal_range": ", ".join(normal.get("normal", [])),
                "status": status,
            })
            continue


        if vital == "spo2":
            match = re.search(r"(\d{2,3})", str(raw_value))
            if not match:
                continue

            value = int(match.group(1))

            if value < normal["min"]:
                status = "Low"
            elif value > normal["max"]:
                status = "High"

            results.append({
                "vital": "SpO₂",
                "patient_value": value,
                "normal_range": f"{normal['min']}–{normal['max']}%",
                "status": status,
            })
            continue

       
        if vital in ["fasting_glucose", "random_glucose"]:
            match = re.search(r"(\d+(\.\d+)?)", str(raw_value))
            if not match:
                continue

            value = float(match.group(1))

            min_val = normal.get("min")
            max_val = normal.get("max")

            if min_val is not None and value < min_val:
                status = "Low"
            elif max_val is not None and value > max_val:
                status = "High"

            results.append({
                "vital": "Blood Sugar",
                "patient_value": value,
                "normal_range": format_range(min_val, max_val),
                "status": status,
            })
            continue

   
        try:
            value = float(raw_value)
        except (ValueError, TypeError):
            continue

        ref = normal
        if normal["type"] == "gender_based" and gender:
            ref = normal.get(gender.lower(), normal)

        min_val = ref.get("min")
        max_val = ref.get("max")

        if min_val is not None and value < min_val:
            status = "Low"
        elif max_val is not None and value > max_val:
            status = "High"

        results.append({
            "vital": vital.replace("_", " ").title(),
            "patient_value": value,
            "normal_range": format_range(min_val, max_val),
            "status": status,
        })

    return results



def format_range(min_val, max_val):
    if min_val is not None and max_val is not None:
        return f"{min_val}-{max_val}"
    if min_val is not None:
        return f"≥{min_val}"
    if max_val is not None:
        return f"≤{max_val}"
    return "Not Defined"
