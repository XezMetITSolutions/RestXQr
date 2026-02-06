
with open(r'c:\Users\Anwender\Downloads\RestXQR\frontend\src\components\HomeContent.tsx', 'rb') as f:
    content = f.read()
    # Find the position of "return ("
    start_pos = content.find(b'return (')
    if start_pos != -1:
        # Print surrounding bytes
        print(f"Bytes around 'return (': {content[start_pos-20:start_pos+100]}")
    else:
        print("Could not find 'return ('")
