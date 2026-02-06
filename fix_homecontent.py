import sys

# Read the file
with open(r'c:\Users\Anwender\Downloads\RestXQR\frontend\src\components\HomeContent.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the syntax error on line 617 - replace the incorrect closing div with proper indentation
# The issue is at line 617 where there's a closing </div> with wrong indentation
content = content.replace('            </div>\r\n        </section>', '                </div>\r\n            </section>')

# Write back
with open(r'c:\Users\Anwender\Downloads\RestXQR\frontend\src\components\HomeContent.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed HomeContent.tsx syntax error!")
