import os
import subprocess

env_path = '.env'
if os.path.exists(env_path):
    key = None
    with open(env_path, 'r') as f:
        for line in f:
            if line.startswith('GROQ_API_KEY='):
                key = line.split('=', 1)[1].strip()
                break
    
    if key:
        print("Found GROQ_API_KEY in .env. Setting via Railway CLI...")
        cmd = f"railway variables set -s kiraa-agent-platform GROQ_API_KEY={key}"
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print("GROQ_API_KEY set successfully.")
        else:
            print(f"Failed to set key. Error: {result.stderr}")
    else:
        print("GROQ_API_KEY not found in .env.")
else:
    print(".env file not found.")
