from django.db import transaction
from ..models import MedicalReport

def cleanup_old_reports(user, keep=6):
    reports = (
        MedicalReport.objects
        .filter(user=user)
        .order_by("-uploaded_at")
    )

    if reports.count() <= keep:
        return

    old_reports = reports[keep:]

    with transaction.atomic():
        for report in old_reports:
            if report.file:
                try:
                    report.file.delete(save=False)
                except Exception:
                    pass
            report.delete()
