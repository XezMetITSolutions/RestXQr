const fs = require('fs');
const path = require('path');

// Read the current staff page file
const staffPagePath = path.join(__dirname, 'src', 'app', 'business', 'staff', 'page.tsx');
let content = fs.readFileSync(staffPagePath, 'utf8');

// Remove all debug modal code
content = content.replace(/\s*{\/\* API Debug Modal \*\/}[\s\S]*?<\/div>\s*\)}/g, '');

// Remove any references to debug state variables and functions
content = content.replace(/const \[showDebugModal, setShowDebugModal\] = useState\(false\);[\s\S]*?const \[debugError, setDebugError\] = useState<string \| null>\(null\);/g, '');
content = content.replace(/\/\/ Special debug function for API issues[\s\S]*?const runApiDiagnostics = async \(\) => {[\s\S]*?};/g, '');

// Fix any remaining syntax issues
content = content.replace(/<FaSync className="text-red-600 mr-2" \/>[\s\S]*?<\/button>\s*<\/div>/g, '');

// Write the fixed content back to the file
fs.writeFileSync(staffPagePath, content, 'utf8');

console.log('Staff page fixed successfully!');
