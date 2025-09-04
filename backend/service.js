const Service = require('node-windows').Service;

// Create a new service object
const svc = new Service({
  name: 'ManifestService',
  description: 'Manifest application that manages waste',
  script: require('path').join(__dirname, 'server.js')
});
console.log(__dirname);

// Listen for the "install" event
svc.on('install', () => {
  svc.start();
});

svc.install();
