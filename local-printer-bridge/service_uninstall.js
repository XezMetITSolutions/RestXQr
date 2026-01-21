const Service = require('node-windows').Service;
const path = require('path');

// Create a new service object
const svc = new Service({
    name: 'RestXQR Printer Bridge',
    script: path.join(__dirname, 'server.js')
});

// Listen for the "uninstall" event so we know when it's done.
svc.on('uninstall', function () {
    console.log('✅ Service uninstalled complete.');
    console.log('The service exists no more.');
});

// Uninstall the service.
console.log('Uninstalling "RestXQR Printer Bridge" service...');
svc.uninstall();
