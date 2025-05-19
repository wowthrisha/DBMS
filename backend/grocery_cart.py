# grocery_cart.py
import cv2
from collections import defaultdict
from ultralytics import YOLO

# Load YOLOv8 model
model = YOLO('yolov8n.pt')  # You must have this file in your directory or use a custom-trained model

# Price list (use lowercase only)
price_list = {
    'apple': 0.5,
    'banana': 0.3,
    'milk': 1.0,
    'bread': 1.5,
    'soda': 1.2,
    'bottle': 1.2
}

# Global state
cap = None
last_visible_cart = defaultdict(int)
scanning = False

def start_scanning():
    global cap, scanning, last_visible_cart
    scanning = True
    cap = cv2.VideoCapture(0)
    print("📸 Scanning started. Adjust items. Press 'q' to stop...")

    while scanning:
        ret, frame = cap.read()
        if not ret:
            print("❌ Failed to capture frame")
            break

        results = model(frame)[0]
        annotated = results.plot()
        current_frame_cart = defaultdict(int)

        for box in results.boxes:
            cls_id = int(box.cls[0])
            class_name = model.names[cls_id].lower()
            print(f"🔍 Detected: {class_name}")
            if class_name in price_list:
                current_frame_cart[class_name] += 1

        last_visible_cart = current_frame_cart.copy()

        cv2.imshow("🛒 Smart Cart View", annotated)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

def stop_scanning():
    global scanning
    scanning = False

def generate_bill(send_sms=True):
    total = 0
    bill_text = "--- Grocery Bill ---\n"
    for item, qty in last_visible_cart.items():
        price = price_list[item]
        subtotal = qty * price
        bill_text += f"{item} x {qty} = ${subtotal:.2f}\n"
        total += subtotal
    bill_text += f"TOTAL: ${total:.2f}"
    print("\n" + bill_text)

    return bill_text, total