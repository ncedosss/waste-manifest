const Service = require('node-windows').Service;

// Create a new service object
const svc = new Service({
  name: 'WacomAgent',
  description: 'A signature pad agent',
  script: require('path').join(__dirname, 'local-agent.js')
});
console.log(__dirname);

// Listen for the "install" event
svc.on('install', () => {
  svc.start();
});

svc.install();
