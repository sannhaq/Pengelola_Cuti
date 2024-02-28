const os = require('os');

const getIpAddress = () => {
  const networkInterfaces = os.networkInterfaces();
  let ipAddress;

  for (const interfaceKey in networkInterfaces) {
    const networkInterface = networkInterfaces[interfaceKey];
    for (let i = 0; i < networkInterface.length; i++) {
      const iface = networkInterface[i];
      if (!iface.internal && iface.family === 'IPv4') {
        ipAddress = iface.address;
        break;
      }
    }
    if (ipAddress) {
      break;
    }
  }

  if (!ipAddress) {
    ipAddress = '127.0.0.1';
  }

  return ipAddress;
};

module.exports = {
  getIpAddress,
};
