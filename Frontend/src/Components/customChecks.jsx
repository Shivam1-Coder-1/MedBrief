export function checkBMI(bmi) {
  if (bmi === null || bmi === undefined || isNaN(bmi)) {
    return { label: "N/A", badge: "badge-neutral" };
  }

  if (bmi < 18.5) {
    return { label: "Underweight", badge: "badge-alert" };
  }

  if (bmi < 25) {
    return { label: "Normal", badge: "badge-safe" };
  }

  if (bmi < 30) {
    return { label: "Overweight", badge: "badge-warning" };
  }

  return { label: "Obese", badge: "badge-alert" };
}

export function checkBloodPressure(bp) {
  if (!bp || typeof bp !== "string" || !bp.includes("/")) {
    return { label: "N/A", badge: "badge-neutral" };
  }

  const [sys, dia] = bp.split("/").map(Number);

  if (isNaN(sys) || isNaN(dia)) {
    return { label: "N/A", badge: "badge-neutral" };
  }

  if (sys < 120 && dia < 80) {
    return { label: "Normal", badge: "badge-safe" };
  }

  if (sys < 140 || dia < 90) {
    return { label: "Elevated", badge: "badge-warning" };
  }

  return { label: "High", badge: "badge-alert" };
}

export function checkHeartRate(hr) {
  if (hr === null || hr === undefined || isNaN(hr)) {
    return { label: "N/A", badge: "badge-neutral" };
  }

  if (hr < 60) {
    return { label: "Low", badge: "badge-warning" };
  }

  if (hr <= 100) {
    return { label: "Normal", badge: "badge-safe" };
  }

  return { label: "High", badge: "badge-alert" };
}

export function checkRespiratoryRate(rr) {
  if (rr === null || rr === undefined || isNaN(rr)) {
    return { label: "N/A", badge: "badge-neutral" };
  }

  if (rr < 12) {
    return { label: "Low", badge: "badge-warning" };
  }

  if (rr <= 20) {
    return { label: "Normal", badge: "badge-safe" };
  }

  return { label: "High", badge: "badge-alert" };
}
