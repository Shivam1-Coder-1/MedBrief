from django.urls import path
from .views import UploadReportView, DownloadReportPDF, ReportHistoryView, DashboardView

urlpatterns = [
    path("upload/", UploadReportView.as_view()),
    path("download/<int:report_id>/", DownloadReportPDF.as_view()),
    path("history/", ReportHistoryView.as_view()),
    path("dashboard/", DashboardView.as_view()),
]
