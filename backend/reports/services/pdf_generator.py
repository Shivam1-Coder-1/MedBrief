from pathlib import Path
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors



def generate_summary_pdf(report, output_path):
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    styles = getSampleStyleSheet()
    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=50,
    )

    content = []

    content.append(Paragraph("<b>Medical Report Summary</b>", styles["Title"]))
    content.append(Spacer(1, 14))


    content.append(Paragraph("<b>1. Patient Details</b>", styles["Heading2"]))

    for k, v in (report.patient_details or {}).items():
        content.append(
            Paragraph(
                f"<b>{k.replace('_', ' ').title()}:</b> {v}",
                styles["Normal"]
            )
        )

    content.append(Spacer(1, 14))


    content.append(Paragraph("<b>2. Vitals Summary</b>", styles["Heading2"]))
    content.append(Spacer(1, 8))

    table_data = [
        ["S.No", "Vital Name", "Value", "Normal Range", "Status"]
    ]

    row_colors = []

    for idx, item in enumerate(report.comparison_table or [], start=1):
        status = item.get("status", "N/A")


        if status == "High":
            bg_color = colors.lightcoral
        elif status == "Low":
            bg_color = colors.lightgoldenrodyellow
        elif status == "Normal":
            bg_color = colors.lightgreen
        else:
            bg_color = colors.whitesmoke

        row_colors.append(bg_color)

        table_data.append([
            str(idx),
            item.get("vital", "N/A"),
            str(item.get("patient_value", "N/A")),
            str(item.get("normal_range", "N/A")),
            status,
        ])

    vitals_table = Table(
        table_data,
        colWidths=[40, 120, 80, 140, 80]
    )

    table_style = [
        ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
        ("GRID", (0, 0), (-1, -1), 0.8, colors.black),
        ("ALIGN", (0, 0), (-1, 0), "CENTER"),
        ("ALIGN", (0, 1), (0, -1), "CENTER"),
        ("ALIGN", (2, 1), (-1, -1), "CENTER"),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
    ]

    for i, color in enumerate(row_colors, start=1):
        table_style.append(
            ("BACKGROUND", (0, i), (-1, i), color)
        )

    vitals_table.setStyle(TableStyle(table_style))
    content.append(vitals_table)
    content.append(Spacer(1, 14))


    content.append(Paragraph("<b>3. Key Observations</b>", styles["Heading2"]))

    observations = report.key_observations or []
    if observations:
        for obs in observations:
            content.append(Paragraph(f"- {obs}", styles["Normal"]))
    else:
        content.append(Paragraph("No significant observations noted.", styles["Normal"]))

    content.append(Spacer(1, 12))


    content.append(Paragraph("<b>4. Conclusion</b>", styles["Heading2"]))
    content.append(
        Paragraph(
            report.final_conclusion or "No conclusion could be generated.",
            styles["Normal"]
        )
    )

    content.append(Spacer(1, 18))


    content.append(
        Paragraph(
            "<i>This summary is generated automatically and is not a medical diagnosis. "
            "Please consult a qualified healthcare professional for clinical advice.</i>",
            styles["Normal"]
        )
    )


    doc.build(content, onLaterPages=add_footer, onFirstPage=add_footer)


def add_footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 9)


    canvas.drawRightString(
        A4[0] - 40,
        30,
        f"Page {doc.page}"
    )


    canvas.drawString(
        40,
        30,
        "This report is auto-generated and is not a medical diagnosis."
    )

    canvas.restoreState()
