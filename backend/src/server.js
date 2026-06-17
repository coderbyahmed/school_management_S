import app from './app.js';
import connectDB from './config/db.js';
import dotenv from 'dotenv';
import dns from 'dns';
import { networkInterfaces } from 'os';

dotenv.config();

// Fix DNS if Node.js is pointed at loopback with no listener
const nodeDnsServers = dns.getServers();
if (nodeDnsServers.includes('127.0.0.1')) {
  const nets = networkInterfaces();
  for (const [, addrs] of Object.entries(nets)) {
    for (const addr of addrs || []) {
      if (!addr.internal && addr.family === 'IPv4') {
        const parts = addr.address.split('.');
        dns.setServers([`${parts[0]}.${parts[1]}.${parts[2]}.1`]);
        break;
      }
    }
    if (!dns.getServers().includes('127.0.0.1')) break;
  }
}

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Server startup failed:', err.message);
    process.exit(1);
  });
