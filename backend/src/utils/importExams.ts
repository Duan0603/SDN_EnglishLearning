import * as fs from 'fs-extra';
import * as path from 'path';
import { prisma } from '../config/prisma.config';
import { ExamService } from '../services/exam.service';

const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'scraped_exams.json');

async function main() {
  console.log('=== Starting Database Import of Scraped Exams ===');

  if (!(await fs.pathExists(OUTPUT_FILE))) {
    console.error(`Scraped exams file not found at: ${OUTPUT_FILE}`);
    console.error('Please run the scraper first using: npm run scrape');
    process.exit(1);
  }

  let scrapedTests: any[] = [];
  try {
    scrapedTests = await fs.readJson(OUTPUT_FILE);
  } catch (err: any) {
    console.error('Error reading scraped exams JSON:', err.message);
    process.exit(1);
  }

  if (scrapedTests.length === 0) {
    console.log('No tests found in the scraped JSON file.');
    return;
  }

  console.log(`Found ${scrapedTests.length} tests in JSON. Checking database...`);

  let successCount = 0;
  let skippedCount = 0;

  for (const testData of scrapedTests) {
    // Check if a test with the same title already exists in the DB
    const existing = await prisma.test.findFirst({
      where: {
        title: {
          equals: testData.title.trim(),
          mode: 'insensitive',
        },
      },
    });

    if (existing) {
      console.log(`[-] Test "${testData.title}" already exists in DB. Skipping.`);
      skippedCount++;
      continue;
    }

    console.log(`[+] Importing "${testData.title}"...`);
    try {
      // Create test using the central exam service
      const createdTest = await ExamService.createExam({
        title: testData.title.trim(),
        description: testData.description,
        type: testData.type || 'READING',
        duration: testData.duration || 60,
        sections: testData.sections,
      });
      
      console.log(`    Successfully imported with ID: ${createdTest.id}`);
      successCount++;
    } catch (err: any) {
      console.error(`    [ERROR] Failed to import "${testData.title}":`, err.message);
    }
  }

  console.log('\n=== Import Summary ===');
  console.log(`Total tests in JSON: ${scrapedTests.length}`);
  console.log(`Successfully imported: ${successCount}`);
  console.log(`Skipped (duplicates):  ${skippedCount}`);
  console.log('======================');
}

main()
  .catch((err) => {
    console.error('Fatal Import Error:', err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
