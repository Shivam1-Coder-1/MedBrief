import pdfplumber
import pytesseract
import cv2
import numpy as np
from pathlib import Path


def extract_text(file_path: str) -> str:
    """
    Detect file type and extract text accordingly.
    """
    extension = Path(file_path).suffix.lower()

    if extension == ".pdf":
        return extract_from_pdf(file_path)
    elif extension in [".jpg", ".jpeg", ".png"]:
        return extract_from_image(file_path)
    else:
        return ""



def extract_from_pdf(file_path: str) -> str:
    text_blocks = []

    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()

            if page_text:
                text_blocks.append(page_text)
            else:

                page_image = page.to_image(resolution=300).original
                ocr_text = pytesseract.image_to_string(page_image)
                if ocr_text:
                    text_blocks.append(ocr_text)

    return "\n".join(text_blocks)

def extract_from_image(file_path: str) -> str:
    image = cv2.imread(file_path)

    if image is None:
        return ""


    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    gray = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY)[1]

    config = r"--oem 3 --psm 6"

    return pytesseract.image_to_string(gray, config=config)
