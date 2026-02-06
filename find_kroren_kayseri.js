const https = require('https');

https.get('https://masapp-backend.onrender.com/api/restaurants', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            const targets = json.data.filter(r => r.name.toLowerCase().includes('kroren') || r.name.toLowerCase().includes('kayseri') || r.name.toLowerCase().includes('capa'));
            console.log(JSON.stringify(targets, null, 2));
        } catch (e) { console.error(e); }
    });
});
