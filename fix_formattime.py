import sys

# Read the file
with open(r'c:\Users\Anwender\Downloads\RestXQR\frontend\src\app\kasa\page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the line after getWaitInfo function closes and before getPaymentBreakdown
new_lines = []
i = 0
while i < len(lines):
    new_lines.append(lines[i])
    # Look for the closing of getWaitInfo function
    if i > 0 and '};' in lines[i] and 'getWaitInfo' in ''.join(lines[max(0, i-10):i]):
        # Check if next non-empty line is getPaymentBreakdown
        next_idx = i + 1
        while next_idx < len(lines) and lines[next_idx].strip() == '':
            new_lines.append(lines[next_idx])
            next_idx += 1
        
        if next_idx < len(lines) and 'getPaymentBreakdown' in lines[next_idx]:
            # Insert formatTime function here
            new_lines.append('\r\n')
            new_lines.append('  const formatTime = (dateString: string) => {\r\n')
            new_lines.append('    const date = new Date(dateString);\r\n')
            new_lines.append("    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });\r\n")
            new_lines.append('  };\r\n')
            i = next_idx - 1
    i += 1

# Write back
with open(r'c:\Users\Anwender\Downloads\RestXQR\frontend\src\app\kasa\page.tsx', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("formatTime function added successfully!")
