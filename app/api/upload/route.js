import { NextResponse } from 'next/server';
import { uploadToSpaces } from '@/lib/spaces';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Digital Ocean Spaces
    const publicUrl = await uploadToSpaces(buffer, file.name, file.type);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: file.name
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
