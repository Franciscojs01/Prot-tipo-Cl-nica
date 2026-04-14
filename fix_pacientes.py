import re
with open('src/components/Pacientes.jsx', 'r') as f:
    text = f.read()
PIPE = chr(124)
OR_OP = PIPE + PIPE
# Fix p.propertyName '' => p.propertyName || ''
text = re.sub(r"p\.([a-zA-Z0-9_]+)\s*''", r"p.\1 " + OR_OP + r" ''", text)
# Fix editing {} => editing || {}
text = re.sub(r"editing\s*\{\}", r"editing " + OR_OP + r" {}", text)
# Fix a.value0 => a.value || 0
text = re.sub(r"a\.value\s*0", r"a.value " + OR_OP + r" 0", text)
# Fix Number(fd.get('value'))  0
text = re.sub(r"Number\(fd\.get\('value'\)\)\s*0", r"Number(fd.get('value')) " + OR_OP + r" 0", text)
# Fix map and length properties so they don't crash
text = text.replace("api.state.patients.length", "(api.state.patients " + OR_OP + " []).length")
text = text.replace("api.state.patients.map", "(api.state.patients " + OR_OP + " []).map")
# Safely handle charAt
text = re.sub(r"([a-zA-Z0-9_\.]+)\.charAt\(0\)", r"(\1 " + OR_OP + r" '?').charAt(0)", text)
# Safe toFixed
text = re.sub(r"([a-zA-Z0-9_\.]+)\.toFixed", r"(\1 " + OR_OP + r" 0).toFixed", text)
# Write back
with open('src/components/Pacientes.jsx', 'w') as f:
    f.write(text)
print("Fixed with Python!")
