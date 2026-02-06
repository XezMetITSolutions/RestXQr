
# Read the file
with open(r'c:\Users\Anwender\Downloads\RestXQR\frontend\src\components\HomeContent.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# We identified that around line 617 there is an extra </div>
# Let's inspect lines 614-620 to be sure
start_idx = 613
end_idx = 620

for i in range(start_idx, end_idx):
    print(f"{i+1}: {lines[i].rstrip()}")

# We want to remove line 617 if it is just a closing div
if '</div>' in lines[616]: # Index 616 is line 617
    print(f"Removing line 617: {lines[616]}")
    lines.pop(616)
    
    # Write back
    with open(r'c:\Users\Anwender\Downloads\RestXQR\frontend\src\components\HomeContent.tsx', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Successfully removed extra closing div.")
else:
    print("Line 617 is not '</div>', aborting.")
