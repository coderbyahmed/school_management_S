import app from './app.js';
import connectDB from './config/db.js';
import dotenv from 'dotenv';
import dns from 'dns';
import { networkInterfaces } from 'os';

dotenv.config();

// Fix DNS if Node.js is pointed at loopback with no listener
(function fixDns() {
  const servers = dns.getServers();
  const hasLoopback = servers.some(s => s === '127.0.0.1' || s === '::1');
  if (!hasLoopback) return;

  const nets = networkInterfaces();
  outer: for (const [, addrs] of Object.entries(nets)) {
    for (const addr of addrs || []) {
      if (!addr.internal && addr.family === 'IPv4') {
        const parts = addr.address.split('.');
        dns.setServers([`${parts[0]}.${parts[1]}.${parts[2]}.1`]);
        break outer;
      }
    }
  }

  // If still on loopback, fall back to public DNS
  if (dns.getServers().some(s => s === '127.0.0.1' || s === '::1')) {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  }
})();

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
