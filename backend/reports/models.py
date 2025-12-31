from django.db import models
from django.contrib.auth.models import User

class MedicalReport(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="medical_reports",
        null=True,
        blank=True
    )
    file = models.FileField(upload_to="reports/")
    original_filename = models.CharField(max_length=255)
    file_size_kb = models.FloatField()

    extracted_text = models.TextField(blank=True, null=True)
    patient_details = models.JSONField(blank=True, null=True)
    vitals = models.JSONField(blank=True, null=True)

    respiratory_rate = models.FloatField(null=True, blank=True)
    bmi = models.FloatField(null=True, blank=True)

    comparison_table = models.JSONField(blank=True, null=True)
    key_observations = models.JSONField(blank=True, null=True)
    final_conclusion = models.TextField(blank=True, null=True)

    summary_pdf = models.FileField(
        upload_to="report_summaries/",
        null=True,
        blank=True
    )

    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.original_filename
