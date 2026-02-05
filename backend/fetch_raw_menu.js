const fs = require('fs');
const https = require('https');

const url = 'https://menu.qoropos.com/qr/nAKIIX7psokayF1I/1sI6bBrXx4kcTIp';

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        fs.writeFileSync('temp_menu_source.html', data);
        console.log('Menu saved to temp_menu_source.html');
    });
}).on('error', (err) => {
    console.error('Error fetching menu:', err);
});
