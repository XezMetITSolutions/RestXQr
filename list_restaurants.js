const https = require('https');

https.get('https://masapp-backend.onrender.com/api/restaurants', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const json = JSON.parse(data);
        const simplified = json.data.map(r => `${r.name}: ${r.id}`).join('\n');
        console.log(simplified);
    });
});
