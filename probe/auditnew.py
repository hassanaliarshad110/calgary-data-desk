import sys, os, subprocess
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
HERE = os.path.dirname(os.path.abspath(__file__))
env = dict(os.environ, NEW_UI=os.path.join(HERE, 'newui'))
subprocess.run([sys.executable, os.path.join(HERE, 'uiaudit_routed.py'), os.path.join(out, 'audit')], env=env)
