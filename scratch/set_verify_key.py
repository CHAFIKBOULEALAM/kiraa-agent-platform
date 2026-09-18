import os
import subprocess

key = "KIRAA_SECRET_VERIFY_2026"
cmd = f"railway variables set -s kiraa-agent-platform INTERNAL_VERIFICATION_KEY={key}"
subprocess.run(cmd, shell=True, capture_output=True)
print("Internal verification key set.")
