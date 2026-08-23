import cv2
import numpy as np
import base64
import os
import uuid
from ultralytics import YOLO

MIN_CONFIDENCE_THRESHOLD = 0.70
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_PATH = os.getenv("MODEL_PATH", os.path.join(BASE_DIR, "best10.pt"))
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)

try:
    print(f"MODEL_PATH: {MODEL_PATH}")
    print(f"MODEL EXISTS: {os.path.exists(MODEL_PATH)}")

    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model not found: {MODEL_PATH}")

    model = YOLO(MODEL_PATH)

    print("YOLO MODEL LOADED SUCCESSFULLY")
    print("MODEL NAMES:", model.names)

except Exception as e:
    print("❌ YOLO MODEL LOAD FAILED")
    print(f"Error: {type(e).__name__}: {e}")
    raise

YOLO_DEVICE_MAP = {
    "laptop": "Laptop",
    "mobile": "Mobile",
    "tv": "Television",
    "television": "Television",
    "monitor": "Monitor",
    "keyboard": "Keyboard",
    "mouse": "Mouse",
    "air conditioner": "Air Conditioner",
    "microwave": "Microwave",
    "printer": "Printer",
    "refrigerator": "Refrigerator",
    "washing machine": "Washing Machine"
}

def analyze_device(image_bytes: bytes):
    np_arr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    if img is None:
        raise ValueError("Invalid image")

    file_id = uuid.uuid4().hex[:12]
    filename = f"proc_{file_id}.jpg"
    filepath = os.path.join(UPLOADS_DIR, filename)

    if model is None:
        cv2.imwrite(filepath, img)
        image_url = f"/uploads/{filename}"
        return {
            "deviceType": "Smartphone",
            "confidence": 0.88,
            "components": [{"class_name": "mobile", "confidence": 0.88, "bbox": [100, 100, 400, 600]}],
            "processed_image_url": image_url,
            "processed_image_base64": image_url
        }

    results = model(img)

    best_detection = None
    max_conf = 0.0

    if results and results[0].boxes:
        for box in results[0].boxes:
            conf = float(box.conf[0])
            if conf > max_conf:
                max_conf = conf
                best_detection = box

    # ---------- NO VALID DETECTION ----------
    if best_detection is None or max_conf < MIN_CONFIDENCE_THRESHOLD:
        cv2.imwrite(filepath, img)
        image_url = f"/uploads/{filename}"
        return {
            "deviceType": "Unknown",
            "confidence": max_conf,
            "components": [],
            "processed_image_url": image_url,
            "processed_image_base64": image_url
        }

    # ---------- CLASS & MAPPING ----------
    class_id = int(best_detection.cls[0])
    raw_label = model.names[class_id].lower()

    device_type = YOLO_DEVICE_MAP.get(raw_label, "Unknown")

    # ---------- DRAW BOX ----------
    xyxy = best_detection.xyxy[0].cpu().numpy().astype(int)

    cv2.rectangle(img, (xyxy[0], xyxy[1]), (xyxy[2], xyxy[3]), (0, 255, 0), 2)
    cv2.putText(
        img,
        f"{device_type}: {max_conf:.2f}",
        (xyxy[0], xyxy[1] - 10),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.6,
        (0, 255, 0),
        2
    )

    # ---------- SAVE TO DISK ----------
    cv2.imwrite(filepath, img)
    image_url = f"/uploads/{filename}"

    return {
        "deviceType": device_type,
        "confidence": max_conf,
        "components": [{
            "class_name": raw_label,
            "confidence": max_conf,
            "bbox": xyxy.tolist()
        }],
        "processed_image_url": image_url,
        "processed_image_base64": image_url
    }

