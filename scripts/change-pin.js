#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');

const configFilePath = path.join(__dirname, '..', 'data', 'auth-config.json');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function changePin() {
  console.log('\n=== Wiki PIN Change Utility ===\n');

  // Ensure data directory exists
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Check if config exists
  let currentPinHash = null;
  if (fs.existsSync(configFilePath)) {
    const config = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));
    currentPinHash = config.pinHash;

    // Verify current PIN if it exists
    const currentPin = await question('Enter current PIN: ');
    const currentHash = crypto.createHash('sha256').update(currentPin).digest('hex');

    if (currentHash !== currentPinHash) {
      console.error('\n❌ Invalid current PIN. Access denied.\n');
      rl.close();
      process.exit(1);
    }
  } else {
    console.log('No existing PIN found. Setting up new PIN...\n');
  }

  // Get new PIN
  const newPin = await question('Enter new 6-digit PIN: ');

  // Validate PIN format
  if (!/^\d{6}$/.test(newPin)) {
    console.error('\n❌ PIN must be exactly 6 digits.\n');
    rl.close();
    process.exit(1);
  }

  // Confirm new PIN
  const confirmPin = await question('Confirm new 6-digit PIN: ');

  if (newPin !== confirmPin) {
    console.error('\n❌ PINs do not match. Please try again.\n');
    rl.close();
    process.exit(1);
  }

  // Hash and save new PIN
  const newPinHash = crypto.createHash('sha256').update(newPin).digest('hex');
  const config = { pinHash: newPinHash };

  fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2), 'utf8');

  console.log('\n✅ PIN successfully changed!\n');
  rl.close();
}

changePin();
