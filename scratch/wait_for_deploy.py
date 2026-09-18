import subprocess
import time
import sys

deployment_id = "bf1ada8a-ff72-4c26-b70b-52750edc2b62"

print(f"Waiting for deployment {deployment_id} to be online without 'Building'...")

for _ in range(60):
    try:
        output = subprocess.check_output(["railway", "service", "list"], text=True)
        if deployment_id in output:
            # find the line with status
            lines = output.split('\n')
            for i, line in enumerate(lines):
                if deployment_id in line:
                    # The status line is usually a couple of lines above
                    # Let's just look at the block for kiraa-agent-platform
                    pass
            
            # Simple check: if deployment ID is in output, and "Building" is not in the same block?
            # Actually, just parse the output
            blocks = output.split('\n\n')
            for block in blocks:
                if deployment_id in block:
                    if 'Building' not in block and 'Online' in block:
                        print("Deployment is ONLINE and not building!")
                        sys.exit(0)
                    else:
                        print("Still building or not online yet...")
    except Exception as e:
        print(f"Error checking status: {e}")
    time.sleep(5)
    
print("Timeout")
sys.exit(1)
