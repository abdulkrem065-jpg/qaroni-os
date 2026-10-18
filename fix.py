import re
import os

os.system("npx tsc --noEmit > tsc-errors.txt || true")
with open("tsc-errors.txt") as f:
    lines = f.read().splitlines()

for line in lines:
    print(line)

