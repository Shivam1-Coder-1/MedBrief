def generate_conclusion(vitals_comparison: list) -> str:
    abnormal_items = [
        item for item in vitals_comparison
        if item.get("status") in ["High", "Low", "Abnormal"]
    ]

    if not vitals_comparison:
        return (
            "No vital information could be evaluated from the report. "
            "Please consult a healthcare professional for further review."
        )

    if not abnormal_items:
        return (
            "All evaluated vital parameters are within the normal range. "
            "Overall findings appear normal. Regular health monitoring is advised."
        )

    # If there are abnormalities
    affected_vitals = {item["vital"] for item in abnormal_items}
    vitals_text = ", ".join(sorted(affected_vitals))

    return (
        f"The report shows abnormal values in the following parameters: {vitals_text}. "
        "These findings may require medical attention. "
        "Please consult a healthcare professional for proper evaluation."
    )
