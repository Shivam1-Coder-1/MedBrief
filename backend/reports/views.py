from pathlib import Path
import os
import tempfile
import logging

from django.conf import settings
from django.http import FileResponse, Http404
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.utils import timezone
from django.core.files import File

from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework import status

from .models import MedicalReport
from .services.text_extractor import extract_text
from .services.text_normalizer import normalize_text
from .services.patient_extractor import extract_patient_details
from .services.vitals_extractor import extract_vitals
from .services.vitals_comparator import compare_vitals
from .services.observation_engine import generate_observations
from .services.conclusion_engine import generate_conclusion
from .services.pdf_generator import generate_summary_pdf
from .services.cleanup_report import cleanup_old_reports

logger = logging.getLogger(__name__)


@method_decorator(csrf_exempt, name="dispatch")
class UploadReportView(APIView):
    """
    Upload and process medical reports (PDF, JPG, JPEG, PNG)
    Extracts patient details, vitals, generates observations and conclusions
    """
    permission_classes = [IsAuthenticated]

    ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"]
    MAX_FILE_SIZE_MB = 10

    def post(self, request):
        """Process uploaded medical report file"""
        
        # Validate file presence
        file = request.FILES.get("report")
        if not file:
            return Response(
                {"error": "No report file provided"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate file size
        if file.size > self.MAX_FILE_SIZE_MB * 1024 * 1024:
            return Response(
                {"error": f"File size exceeds {self.MAX_FILE_SIZE_MB} MB limit"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate file extension
        if not any(file.name.lower().endswith(ext) for ext in self.ALLOWED_EXTENSIONS):
            return Response(
                {"error": "Unsupported file type. Allowed: PDF, JPG, JPEG, PNG"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Create medical report record
            report = MedicalReport.objects.create(
                user=request.user,
                file=file,
                original_filename=file.name,
                file_size_kb=round(file.size / 1024, 2),
            )
            logger.info(f"Report created with ID {report.id} for user {request.user.username}")

            # Extract and normalize text
            raw_text = extract_text(report.file.path)
            text = normalize_text(raw_text)

            # Extract patient details
            patient_details = extract_patient_details(text)
            patient_details = {k: v or "Not Available" for k, v in patient_details.items()}

            # Extract vitals
            vitals = extract_vitals(text)
            
            # Compare vitals with normal ranges
            comparison_table = compare_vitals(
                vitals=vitals,
                gender=patient_details.get("gender"),
            )

            # Generate AI observations and conclusions
            observations = generate_observations(comparison_table)
            final_conclusion = generate_conclusion(comparison_table)

            # Calculate BMI if available
            bmi = None
            try:
                bmi_value = vitals.get("bmi")
                if bmi_value:
                    bmi = round(float(bmi_value), 1)
            except (ValueError, TypeError):
                pass

            # Calculate BMI from weight and height if not extracted
            if bmi is None:
                try:
                    weight = float(patient_details.get("weight", 0))
                    height_cm = float(patient_details.get("height", 0))
                    if weight > 0 and height_cm > 0:
                        height_m = height_cm / 100
                        bmi = round(weight / (height_m ** 2), 1)
                except (ValueError, TypeError, ZeroDivisionError):
                    pass

            # Extract respiratory rate
            respiratory_rate = None
            try:
                rr_value = vitals.get("respiratory_rate")
                if rr_value:
                    respiratory_rate = float(rr_value)
            except (ValueError, TypeError):
                pass

            # Save all extracted data
            report.extracted_text = text
            report.patient_details = patient_details
            report.vitals = vitals
            report.comparison_table = comparison_table
            report.key_observations = observations
            report.final_conclusion = final_conclusion
            report.bmi = bmi
            report.respiratory_rate = respiratory_rate
            report.save()

            # Generate PDF summary
            pdf_generated = False
            try:
                with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
                    generate_summary_pdf(report, tmp.name)
                    tmp.seek(0)
                    
                    pdf_filename = f"Medical_Report_Summary_{report.id}.pdf"
                    report.summary_pdf.save(pdf_filename, File(tmp), save=True)
                    pdf_generated = True
                    logger.info(f"PDF generated successfully for report {report.id}")
                    
                    # Clean up temp file
                    try:
                        os.unlink(tmp.name)
                    except Exception as e:
                        logger.warning(f"Failed to delete temp file: {e}")
                        
            except Exception as e:
                logger.error(f"PDF generation failed for report {report.id}: {str(e)}")
                # Continue without PDF - it's not critical

            # Cleanup old reports (keep last 6)
            try:
                cleanup_old_reports(request.user)
            except Exception as e:
                logger.warning(f"Cleanup failed: {str(e)}")

            # Build response
            response_data = {
                "success": True,
                "message": "Report processed successfully",
                "report_id": report.id,
                "bmi": bmi,
                "respiratory_rate": respiratory_rate,
                "final_conclusion": final_conclusion,
                "patient_details": patient_details,
                "vitals": vitals,
                "key_observations": observations,
                "pdf_generated": pdf_generated,
            }

            return Response(response_data, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Report processing error: {str(e)}", exc_info=True)
            return Response(
                {"error": "Failed to process report. Please try again."}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class DownloadReportPDF(APIView):
    """
    Download the generated PDF summary for a specific report
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, report_id):
        """Download PDF summary of medical report"""
        
        try:
            # Get report for current user only
            report = MedicalReport.objects.get(
                id=report_id,
                user=request.user
            )
        except MedicalReport.DoesNotExist:
            raise Http404("Report not found or you don't have permission to access it")

        # Check if PDF exists
        if not report.summary_pdf:
            return Response(
                {"error": "PDF summary not available for this report"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if file exists on disk
        if not os.path.exists(report.summary_pdf.path):
            return Response(
                {"error": "PDF file not found on server"},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            # Return PDF file
            response = FileResponse(
                report.summary_pdf.open("rb"),
                as_attachment=True,
                filename=f"Medical_Report_{report_id}.pdf",
                content_type="application/pdf"
            )
            return response
            
        except Exception as e:
            logger.error(f"Error serving PDF for report {report_id}: {str(e)}")
            return Response(
                {"error": "Failed to download PDF"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ReportHistoryView(APIView):
    """
    Get list of all uploaded reports for current user
    Returns last 6 reports in descending order
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Retrieve report history for authenticated user"""
        
        try:
            # Get last 6 reports
            reports = (
                MedicalReport.objects
                .filter(user=request.user)
                .order_by("-uploaded_at")[:6]
            )

            data = []
            for report in reports:
                # Convert to local timezone
                local_time = timezone.localtime(report.uploaded_at)
                
                # Build response for each report
                report_data = {
                    "id": report.id,
                    "filename": report.original_filename,
                    "uploaded_at": local_time.strftime("%d %b %Y, %I:%M %p"),
                    "file_size_kb": report.file_size_kb,
                    "final_conclusion": report.final_conclusion or "Processing...",
                    "status": self._derive_status(report),
                    "bmi": report.bmi,
                    "respiratory_rate": report.respiratory_rate,
                    "has_pdf": bool(report.summary_pdf),
                    "pdf_url": (
                        request.build_absolute_uri(f"/api/reports/download/{report.id}/")
                        if report.summary_pdf else None
                    ),
                }
                data.append(report_data)

            return Response({
                "success": True,
                "count": len(data),
                "reports": data
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error fetching report history: {str(e)}")
            return Response(
                {"error": "Failed to fetch report history"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _derive_status(self, report):
        """Determine overall health status from comparison table"""
        if not report.comparison_table:
            return "Unknown"

        abnormal_count = 0
        for item in report.comparison_table:
            item_status = item.get("status", "").lower()
            if item_status in ["high", "low", "abnormal"]:
                abnormal_count += 1

        if abnormal_count == 0:
            return "Normal"
        elif abnormal_count <= 2:
            return "Attention"
        else:
            return "Critical"


class DashboardView(APIView):
    
    permission_classes = [IsAuthenticated]
    

    def get(self, request):
        print("USER:", request.user, "AUTH:", request.auth)
        
        try:
            reports = list(
                MedicalReport.objects
                .filter(user=request.user)
                .order_by("-uploaded_at")[:6]
            )

            if not reports:
                return Response(
                    {
                        "success": True,
                        "latest_vitals": None,
                        "bmi_trend": [],
                        "heart_rate_trend": [],
                        "total_reports": 0,
                        "message": "No reports uploaded yet"
                    },
                    status=status.HTTP_200_OK,
                )

            # Get latest report data
            latest_report = reports[0]

            # Extract latest vitals
            latest_vitals = {
                "bp": None,
                "bp_status": None,
                "bmi": latest_report.bmi,
                "respiratory_rate": latest_report.respiratory_rate,
                "heart_rate": None,
                "temperature": None,
                "spo2": None,
                "raw_vitals": latest_report.vitals or {},
            }

            # Extract heart rate
            if latest_report.vitals:
                latest_vitals["heart_rate"] = latest_report.vitals.get("heart_rate")
                latest_vitals["temperature"] = latest_report.vitals.get("temperature")
                latest_vitals["spo2"] = latest_report.vitals.get("spo2")

            # Extract blood pressure with status
            if latest_report.comparison_table:
                for item in latest_report.comparison_table:
                    vital = item.get("vital", "").lower()
                    if "blood pressure" in vital:
                        latest_vitals["bp"] = item.get("patient_value")
                        latest_vitals["bp_status"] = item.get("status")
                        break

            # Build BMI trend (oldest to newest)
            bmi_trend = []
            for report in reversed(reports):
                if report.bmi is not None:
                    bmi_trend.append({
                        "value": report.bmi,
                        "date": timezone.localtime(report.uploaded_at).strftime("%d %b"),
                        "report_id": report.id
                    })

            # Build heart rate trend
            heart_rate_trend = []
            for report in reversed(reports):
                if report.vitals and report.vitals.get("heart_rate"):
                    try:
                        hr_value = float(report.vitals.get("heart_rate"))
                        heart_rate_trend.append({
                            "value": hr_value,
                            "date": timezone.localtime(report.uploaded_at).strftime("%d %b"),
                            "report_id": report.id
                        })
                    except (ValueError, TypeError):
                        pass

            # Calculate total reports
            total_reports = MedicalReport.objects.filter(user=request.user).count()

            return Response(
                {
                    "success": True,
                    "latest_vitals": latest_vitals,
                    "bmi_trend": bmi_trend,
                    "heart_rate_trend": heart_rate_trend,
                    "total_reports": total_reports,
                    "latest_report_date": timezone.localtime(latest_report.uploaded_at).strftime("%d %b %Y, %I:%M %p"),
                    "latest_conclusion": latest_report.final_conclusion,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            logger.error(f"Dashboard error: {str(e)}", exc_info=True)
            return Response(
                {"error": "Failed to load dashboard data"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )