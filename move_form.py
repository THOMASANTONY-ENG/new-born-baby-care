import sys

filepath = r"src/pages/Parentdashboard.jsx"
with open(filepath, "r", encoding="utf-8") as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if line.strip() == "{(isEditing || !hasSavedProfile) ? (":
        start_idx = i
    if start_idx != -1 and line.strip() == ") : null}" and i > start_idx:
        end_idx = i + 1
        break

if start_idx != -1 and end_idx != -1:
    form_block = lines[start_idx:end_idx]
    del lines[start_idx:end_idx]

    # Find insertion point
    for i, line in enumerate(lines):
        if 'id="care-status-heading"' in line:
            # line i is the h2. line i-3 is the section start.
            insert_point = i - 3
            lines = lines[:insert_point] + form_block + lines[insert_point:]
            break
else:
    print("Could not find block, perhaps already moved")

# update isEditing
updated = False
for i, line in enumerate(lines):
    if "const [isEditing, setIsEditing] = useState(() =>" in line:
        lines[i] = "  const [isEditing, setIsEditing] = useState(() => {\n"
        lines[i+1] = "    const profile = savedProfile.babies[0] || {}\n"
        lines.insert(i+2, "    return !profile.name || !profile.dob\n")
        lines[i+3] = "  })\n"
        updated = True
        break

with open(filepath, "w", encoding="utf-8") as f:
    f.writelines(lines)
print("Done!")
