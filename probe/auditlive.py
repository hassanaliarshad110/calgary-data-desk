import sys, os, subprocess
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
HERE = os.path.dirname(os.path.abspath(__file__))
subprocess.run([sys.executable, os.path.join(HERE, 'uiaudit.py'), os.path.join(out, 'audit')])
