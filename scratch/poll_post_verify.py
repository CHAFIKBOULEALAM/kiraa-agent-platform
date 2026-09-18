import time
import urllib.request
import json

url = "https://kiraa-agent-platform-production.up.railway.app/api/internal/verify-db"

for i in range(30):
    try:
        req = urllib.request.Request(url, method="POST")
        req.add_header("X-Internal-Verification-Key", "KIRAA_SECRET_VERIFY_2026")
        response = urllib.request.urlopen(req)
        data = json.loads(response.read().decode('utf-8'))
        
        # Check if the migrationsError exists
        if 'migrationsError' in data and data['migrationsError']:
            print(f"Attempt {i+1}: Migrations failed with error. Retrying in 15s...")
            time.sleep(15)
            continue
            
        print("Hit NEW container! Data:", json.dumps(data, indent=2))
        break
    except Exception as e:
        print(f"Attempt {i+1}: Failed to hit endpoint: {e}")
        time.sleep(15)
else:
    print("Timeout waiting for new container to serve traffic.")
