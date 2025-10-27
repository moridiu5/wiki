import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const configFilePath = path.join(process.cwd(), 'data', 'auth-config.json');

// Ensure data directory and config file exist
const ensureConfigFile = () => {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(configFilePath)) {
    // Default PIN: 123456 (hashed)
    const defaultPin = '123456';
    const hash = crypto.createHash('sha256').update(defaultPin).digest('hex');
    const config = { pinHash: hash };
    fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2), 'utf8');
  }
};

// GET - Verify PIN
export async function POST(request) {
  try {
    ensureConfigFile();

    const { pin } = await request.json();

    if (!pin) {
      return NextResponse.json({ error: 'PIN required' }, { status: 400 });
    }

    // Read stored PIN hash
    const fileContent = fs.readFileSync(configFilePath, 'utf8');
    const config = JSON.parse(fileContent);

    // Hash provided PIN and compare
    const pinHash = crypto.createHash('sha256').update(pin).digest('hex');
    const isValid = pinHash === config.pinHash;

    return NextResponse.json({ valid: isValid });
  } catch (error) {
    console.error('Error verifying PIN:', error);
    return NextResponse.json({ error: 'Failed to verify PIN' }, { status: 500 });
  }
}
