import time
import urllib.request
import json

url = "https://kiraa-agent-platform-production.up.railway.app/api/internal/verify-db"
req = urllib.request.Request(url)
req.add_header("X-Internal-Verification-Key", "KIRAA_SECRET_VERIFY_2026")

for i in range(30):
    try:
        response = urllib.request.urlopen(req)
        if response.status == 200:
            data = json.loads(response.read().decode('utf-8'))
            print("SUCCESS! Data:", json.dumps(data, indent=2))
            break
    except Exception as e:
        print(f"Attempt {i+1}: Route not ready or failed. ({e})")
    time.sleep(5)
else:
    print("Timed out waiting for verify-db route.")
