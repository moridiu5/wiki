#!/usr/bin/env node

/**
 * Migration script to transfer data from JSON file to MySQL database
 *
 * Usage: node scripts/migrate-json-to-mysql.js
 *
 * This script will:
 * 1. Read the existing data from data/wiki-data.json
 * 2. Connect to MySQL database
 * 3. Create sections and pages with proper relations
 * 4. Maintain the order and structure
 */

import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function migrate() {
  try {
    console.log('🚀 Starting migration from JSON to MySQL...\n');

    // Read JSON file
    const jsonPath = path.join(__dirname, '../data/wiki-data.json');

    if (!fs.existsSync(jsonPath)) {
      console.log('❌ No wiki-data.json file found. Nothing to migrate.');
      return;
    }

    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    if (!jsonData.sections || jsonData.sections.length === 0) {
      console.log('❌ No sections found in JSON file. Nothing to migrate.');
      return;
    }

    console.log(`📚 Found ${jsonData.sections.length} sections to migrate\n`);

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing database data...');
    await prisma.metadataField.deleteMany({});
    await prisma.page.deleteMany({});
    await prisma.section.deleteMany({});
    console.log('✅ Database cleared\n');

    // Migrate sections and pages
    let totalPages = 0;

    for (let index = 0; index < jsonData.sections.length; index++) {
      const section = jsonData.sections[index];

      console.log(`📁 Migrating section: "${section.title}"`);

      // Create section
      const createdSection = await prisma.section.create({
        data: {
          title: section.title,
          order: index
        }
      });

      // Create pages for this section
      if (section.pages && section.pages.length > 0) {
        for (const page of section.pages) {
          console.log(`  📄 Creating page: "${page.title}"`);

          await prisma.page.create({
            data: {
              title: page.title,
              content: page.content || '',
              sectionId: createdSection.id,
              metadataImage: page.metadata?.image || null,
              metadataFields: {
                create: (page.metadata?.fields || []).map(field => ({
                  key: field.key,
                  value: field.value
                }))
              }
            }
          });

          totalPages++;
        }
      }

      console.log(`✅ Section "${section.title}" migrated with ${section.pages?.length || 0} pages\n`);
    }

    console.log('🎉 Migration completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Sections migrated: ${jsonData.sections.length}`);
    console.log(`   - Pages migrated: ${totalPages}`);
    console.log('\n💡 You can now update your .env file with your Digital Ocean MySQL credentials');
    console.log('💡 Run "npm run dev" to start the application with the database');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrate();
