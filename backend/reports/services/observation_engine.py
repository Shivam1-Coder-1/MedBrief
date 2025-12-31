def generate_observations(vitals_comparison: list) -> list:
    

    if not vitals_comparison:
        return []

    observations = []
    seen = set()

    for item in vitals_comparison:
        vital = item.get("vital")
        status = item.get("status")

        if not vital or vital in seen:
            continue

        if status == "High":
            observations.append(
                f"{vital} is higher than the normal range."
            )

        elif status == "Low":
            observations.append(
                f"{vital} is lower than the normal range."
            )

        elif status == "Abnormal":
            observations.append(
                f"{vital} result is abnormal."
            )

        seen.add(vital)


    return observations[:6]
