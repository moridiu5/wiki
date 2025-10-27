import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'wiki-data.json');

// Ensure data directory exists
const ensureDataDirectory = () => {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// GET - Read wiki data
export async function GET() {
  try {
    ensureDataDirectory();

    if (!fs.existsSync(dataFilePath)) {
      // Return initial data if file doesn't exist
      const { initialData } = await import('@/data/sample-data');
      return NextResponse.json(initialData);
    }

    const fileContent = fs.readFileSync(dataFilePath, 'utf8');
    const data = JSON.parse(fileContent);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading wiki data:', error);
    return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
  }
}

// POST - Write wiki data
export async function POST(request) {
  try {
    ensureDataDirectory();

    const data = await request.json();
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error writing wiki data:', error);
    return NextResponse.json({ error: 'Failed to write data' }, { status: 500 });
  }
}
