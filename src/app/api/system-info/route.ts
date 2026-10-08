import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    nodeVersion: process.version,
    platform: process.platform,
    env: process.env.NODE_ENV,
    uptime: process.uptime(),
  });
}
