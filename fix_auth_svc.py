with open('src/application/authorization/AuthorizationService.ts', 'r') as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if "3. Verify Branch is active" in line:
        skip = True
        continue
    if skip and "4. Resolve Effective Permissions" in line:
        skip = False
        new_lines.append(line)
        continue
    if not skip:
        new_lines.append(line)

with open('src/application/authorization/AuthorizationService.ts', 'w') as f:
    f.writelines(new_lines)
