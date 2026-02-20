require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function initServerMonitoring() {
  console.log('🚀 Initializing server monitoring configurations...');

  // Default server monitors to set up
  const defaultMonitors = [
    {
      id: 'nginx-server',
      name: 'nginx',
      displayName: 'Nginx Web Server',
      type: 'webserver',
      host: 'localhost',
      port: 80,
      checkUrl: null,
      checkCommand: 'nginx',
      isActive: true,
    },
    {
      id: 'postgresql-db',
      name: 'postgresql',
      displayName: 'PostgreSQL Database',
      type: 'database',
      host: 'localhost',
      port: 5432,
      checkUrl: null,
      checkCommand: null,
      isActive: true,
    },
    {
      id: 'nextjs-app',
      name: 'nextjs',
      displayName: 'Next.js Application',
      type: 'application',
      host: 'localhost',
      port: 3000,
      checkUrl: 'http://localhost:3000/api/health',
      checkCommand: null,
      isActive: true,
    },
    {
      id: 'tts-service',
      name: 'tts-service',
      displayName: 'TTS Service',
      type: 'service',
      host: 'localhost',
      port: 3001,
      checkUrl: 'http://localhost:3001/health',
      checkCommand: null,
      isActive: true,
    },
  ];

  for (const monitor of defaultMonitors) {
    try {
      // Check if monitor already exists
      const existing = await prisma.serverMonitor.findUnique({
        where: { id: monitor.id }
      });

      if (existing) {
        console.log(`✅ Monitor "${monitor.displayName}" already exists`);
        continue;
      }

      // Create new monitor
      await prisma.serverMonitor.create({
        data: monitor
      });

      console.log(`✨ Created monitor: ${monitor.displayName}`);
    } catch (error) {
      console.error(`❌ Error creating monitor ${monitor.displayName}:`, error);
    }
  }

  console.log('🎉 Server monitoring initialization complete!');
}

async function main() {
  try {
    await initServerMonitoring();
  } catch (error) {
    console.error('❌ Failed to initialize server monitoring:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();