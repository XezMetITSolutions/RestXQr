const Service = require('node-windows').Service;
const path = require('path');

// Create a new service object
const svc = new Service({
    name: 'RestXQR Printer Bridge',
    description: 'Local printer bridge for RestXQR cloud application. Allows printing to local thermal printers.',
    script: path.join(__dirname, 'server.js'),
    nodeOptions: [
        '--harmony',
        '--max_old_space_size=4096'
    ]
    //, workingDirectory: __dirname
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install', function () {
    console.log('✅ Service installed successfully!');
    console.log('🚀 Starting service...');
    svc.start();
});

svc.on('alreadyinstalled', function () {
    console.log('⚠️ Service is already installed.');
    console.log('Attempting to start it...');
    svc.start();
});

svc.on('start', function () {
    console.log('✅ Service started!');
    console.log('The bridge is now running in the background.');
    console.log('You do not need to keep any windows open.');
});

// Just in case this file is run twice.
svc.on('invalidinstallation', function () {
    console.log('❌ Invalid installation. Please uninstall first.');
});

svc.on('error', function (e) {
    console.log('❌ Error: ', e);
});

// Install the script as a service.
console.log('Installing "RestXQR Printer Bridge" as a Windows Service...');
console.log('PLEASE NOTE: You might get a prompt to allow this action.');
svc.install();
