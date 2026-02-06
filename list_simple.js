const https = require('https');

https.get('https://masapp-backend.onrender.com/api/restaurants', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            // Only print name and id, nicely formatted
            const results = json.data.map(r => `NAME: ${r.name} || ID: ${r.id}`);
            console.log(results.join('\n'));
        } catch (e) { console.error(e); }
    });
});
