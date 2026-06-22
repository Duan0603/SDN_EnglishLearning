import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs-extra';
import * as path from 'path';

// Output Paths
const DATA_DIR = path.join(__dirname, '..', 'data');
const TRACKER_FILE = path.join(DATA_DIR, 'scraped_tracker.json');
const OUTPUT_FILE = path.join(DATA_DIR, 'scraped_exams.json');
const LOCAL_HTML_DIR = path.join(DATA_DIR, 'raw_html');

// Ensure directories exist
fs.ensureDirSync(DATA_DIR);
fs.ensureDirSync(LOCAL_HTML_DIR);

// Define Prisma-compliant structures
interface RawQuestion {
  questionNumber: number;
  type: 'MULTIPLE_CHOICE' | 'FILL_IN_BLANKS' | 'MATCHING_HEADINGS' | 'TRUE_FALSE_NOT_GIVEN' | 'SHORT_ANSWER';
  content: string;
  options: string[] | null;
  answer: string;
  explanation: string | null;
}

interface RawSection {
  sectionOrder: number;
  title: string;
  passageText: string;
  questions: RawQuestion[];
}

interface RawTest {
  title: string;
  description: string;
  type: 'READING';
  duration: number;
  sections: RawSection[];
  sourceUrl?: string;
}

// Request Headers for Axios to mimic a real user
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
};

// Sleep helper for throttling
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Load tracked URLs (to prevent duplicate scraping)
 */
async function getTracker(): Promise<string[]> {
  if (await fs.pathExists(TRACKER_FILE)) {
    try {
      return await fs.readJson(TRACKER_FILE);
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Save tracked URL
 */
async function saveToTracker(url: string) {
  const tracker = await getTracker();
  if (!tracker.includes(url)) {
    tracker.push(url);
    await fs.writeJson(TRACKER_FILE, tracker, { spaces: 2 });
  }
}

/**
 * Save scraped tests, preserving old tests and avoiding duplicates
 */
async function saveScrapedExams(newTests: RawTest[]) {
  let existingTests: RawTest[] = [];
  if (await fs.pathExists(OUTPUT_FILE)) {
    try {
      existingTests = await fs.readJson(OUTPUT_FILE);
    } catch {
      existingTests = [];
    }
  }

  for (const newTest of newTests) {
    const isDuplicate = existingTests.some(
      (t) => t.title.toLowerCase().trim() === newTest.title.toLowerCase().trim()
    );

    if (!isDuplicate) {
      existingTests.push(newTest);
      console.log(`Saved new test: "${newTest.title}" to JSON.`);
    } else {
      console.log(`Skipped saving duplicate test title: "${newTest.title}"`);
    }
  }

  await fs.writeJson(OUTPUT_FILE, existingTests, { spaces: 2 });
}

/**
 * Normalizes question types from HTML/NextJS formats to Prisma QuestionType
 */
function determineQuestionType(typeStr: string, content: string, options: any[]): any {
  const norm = typeStr?.toUpperCase() || '';
  if (norm.includes('MULTIPLE') || norm.includes('CHOICE') || (options && options.length > 1 && !content.includes('TRUE') && !content.includes('YES'))) {
    return 'MULTIPLE_CHOICE';
  }
  if (norm.includes('TRUE_FALSE') || norm.includes('NOT_GIVEN') || content.includes('TRUE/FALSE') || content.includes('YES/NO')) {
    return 'TRUE_FALSE_NOT_GIVEN';
  }
  if (norm.includes('MATCHING') || norm.includes('HEADING')) {
    return 'MATCHING_HEADINGS';
  }
  if (norm.includes('FILL') || norm.includes('BLANK') || content.includes('____') || content.includes('fill in')) {
    return 'FILL_IN_BLANKS';
  }
  return 'SHORT_ANSWER';
}

/**
 * Parses NextJS state data if available in script#__NEXT_DATA__
 */
function parseNextData(html: string): RawTest | null {
  const $ = cheerio.load(html);
  const nextDataScript = $('script#__NEXT_DATA__').html();
  if (!nextDataScript) return null;

  try {
    const json = JSON.parse(nextDataScript);
    
    // Attempt to drill down into common NextJS props patterns for ieltsonlinetests
    const pageProps = json?.props?.pageProps;
    if (!pageProps) return null;

    // Look for test/exam data in pageProps
    const testData = pageProps.test || pageProps.exam || pageProps.testData;
    if (!testData || !testData.title) return null;

    console.log(`[Next.js JSON Parser] Found structured test data: "${testData.title}"`);

    const sections: RawSection[] = [];
    const rawSections = testData.sections || testData.parts || [];

    rawSections.forEach((sec: any, index: number) => {
      const questions: RawQuestion[] = [];
      const rawQuestions = sec.questions || [];

      rawQuestions.forEach((q: any, qIdx: number) => {
        const optionsList: string[] = [];
        if (q.options) {
          if (Array.isArray(q.options)) {
            optionsList.push(...q.options.map((opt: any) => typeof opt === 'string' ? opt : opt.text || ''));
          } else if (typeof q.options === 'object') {
            optionsList.push(...Object.values(q.options).map((v: any) => String(v)));
          }
        }

        questions.push({
          questionNumber: q.questionNumber || q.number || (qIdx + 1),
          type: determineQuestionType(q.type || '', q.content || '', optionsList),
          content: q.content || q.text || `Question ${q.questionNumber || (qIdx + 1)}`,
          options: optionsList.length > 0 ? optionsList : null,
          answer: q.answer || q.correctAnswer || '',
          explanation: q.explanation || q.explain || null,
        });
      });

      sections.push({
        sectionOrder: sec.order || sec.sectionOrder || (index + 1),
        title: sec.title || `Passage ${index + 1}`,
        passageText: sec.passageText || sec.text || sec.content || '',
        questions,
      });
    });

    return {
      title: testData.title,
      description: testData.description || `Scraped IELTS Reading Test: ${testData.title}`,
      type: 'READING',
      duration: testData.duration || 60,
      sections,
    };
  } catch (error) {
    console.error('Error parsing __NEXT_DATA__ JSON:', error);
    return null;
  }
}

/**
 * Fallback DOM HTML Scraping using Cheerio selectors
 */
function parseDomHtml(html: string, sourceUrl?: string): RawTest {
  const $ = cheerio.load(html);
  
  // Extract Title: Fallback from <title> or page heading
  let testTitle = $('title').text().replace('| IELTS Online Tests', '').replace('| IOT', '').trim();
  
  if (!testTitle || testTitle.toLowerCase() === 'part 1' || testTitle.toLowerCase().includes('take test') || testTitle.toLowerCase().includes('reading practice test')) {
    const pageHeader = $('.take-test__title, h1.page-title, .title-exam').first().text().trim();
    if (pageHeader && pageHeader.toLowerCase() !== 'part 1') {
      testTitle = pageHeader;
    }
  }
  
  // If title is still "Part 1" or generic, try extracting from the URL
  if ((!testTitle || testTitle.toLowerCase() === 'part 1') && sourceUrl) {
    try {
      const lastSegment = sourceUrl.split('/').filter(Boolean).pop();
      if (lastSegment && !lastSegment.startsWith('local:')) {
        testTitle = lastSegment
          .split('-')
          .map(word => {
            if (word.toLowerCase() === 'ielts') return 'IELTS';
            return word.charAt(0).toUpperCase() + word.slice(1);
          })
          .join(' ');
      }
    } catch {
      // Parsing failed
    }
  }

  if (!testTitle || testTitle.toLowerCase() === 'part 1') {
    testTitle = 'IELTS Reading Practice Test';
  }
  
  const sections: RawSection[] = [];

  // Scrape passage sections (Usually 3 parts)
  const passageSections = $('section.test-contents.ckeditor-wrapper');
  
  if (passageSections.length > 0) {
    passageSections.each((index, el) => {
      const order = index + 1;
      
      // Extract subtitle/title of the passage
      let title = $(el).find('h2.subtitle, .field--name-field-subtitle-section').first().text().trim();
      if (!title) {
        title = $(el).find('h1, h2').first().text().trim() || `Reading Passage ${order}`;
      }
      
      // Extract passage text (HTML content to preserve formatting)
      const passageText = $(el).find('.field--name-field-passage').html() || $(el).html() || '';

      const questions: RawQuestion[] = [];
      
      // Match with the corresponding test panel for questions (0-indexed matching)
      const questionPanel = $('section.test-panel').eq(index);
      
      if (questionPanel.length > 0) {
        // Parse select dropdowns (commonly used for Matching Headings, MCQs, TFNG)
        questionPanel.find('select.iot-lr-question, select.iot-option').each((qIdx, selectEl) => {
          const qIdAttr = $(selectEl).attr('id') || '';
          const qNumAttr = $(selectEl).attr('data-num') || '';
          const questionNumber = parseInt(qIdAttr.replace('q-', '') || qNumAttr, 10) || (qIdx + 1);
          
          // Question text is usually the parent element's text (excluding the select's own options)
          const parent = $(selectEl).parent();
          // Clone the parent, remove the select to get the raw text
          const clonedParent = parent.clone();
          clonedParent.find('select, span.iot-question-number, b.iot-question-number').remove();
          const content = clonedParent.text().replace(/\s+/g, ' ').trim() || `Question ${questionNumber}`;

          // Extract options from <option> tags
          const optionsList: string[] = [];
          $(selectEl).find('option').each((_, optEl) => {
            const val = $(optEl).val() || $(optEl).text();
            if (val && String(val).trim() !== '') {
              optionsList.push(String(val).trim());
            }
          });

          // Extract Answer if present in DOM (for solutions/review pages)
          let answer = $(selectEl).attr('data-answer') || '';
          if (!answer) {
            const correctOpt = $(selectEl).find('option[selected], option.correct, option.active');
            if (correctOpt.length > 0) {
              answer = correctOpt.val() as string || correctOpt.text();
            }
          }
          if (!answer) {
            const siblingAnswer = parent.find('.correct-answer, .answer-key, .solution, span.correct');
            if (siblingAnswer.length > 0) {
              answer = siblingAnswer.text().trim();
            }
          }

          const qType = determineQuestionType('', content, optionsList);

          questions.push({
            questionNumber,
            type: qType,
            content,
            options: optionsList.length > 0 ? optionsList : null,
            answer: answer.trim() || 'A',
            explanation: parent.find('.explanation, .explanation-content').text().trim() || null,
          });
        });

        // Parse text inputs (commonly used for Fill in the Blanks / Sentence Completion)
        questionPanel.find('input.iot-question__fill-blank, input.iot-lr-question').each((qIdx, inputEl) => {
          const qIdAttr = $(inputEl).attr('id') || '';
          const qNumAttr = $(inputEl).attr('data-num') || '';
          const questionNumber = parseInt(qIdAttr.replace('q-', '') || qNumAttr, 10);
          if (isNaN(questionNumber)) return;
          
          if (questions.some(q => q.questionNumber === questionNumber)) return;

          const parent = $(inputEl).parent();
          const clonedParent = parent.clone();
          clonedParent.find(`input#q-${questionNumber}`).replaceWith(' _______ ');
          clonedParent.find('span.iot-question-number, b.iot-question-number').remove();
          const content = clonedParent.text().replace(/\s+/g, ' ').trim() || `Complete the blank: Question ${questionNumber}`;

          let answer = $(inputEl).attr('data-answer') || $(inputEl).val() as string || '';
          if (!answer) {
            const siblingAnswer = parent.find('.correct-answer, .answer-key, .solution');
            if (siblingAnswer.length > 0) {
              answer = siblingAnswer.text().trim();
            }
          }

          questions.push({
            questionNumber,
            type: 'FILL_IN_BLANKS',
            content,
            options: null,
            answer: answer.trim() || 'Answer key',
            explanation: parent.find('.explanation, .explanation-content').text().trim() || null,
          });
        });

        // Parse Multiple Choice Radio / Checkbox Groups
        questionPanel.find('.test-panel__question-sm-group, .question-sm-group').each((qIdx, groupEl) => {
          const dataNum = $(groupEl).attr('data-num') || '';
          const questionNumber = parseInt(dataNum, 10);
          if (isNaN(questionNumber)) return;

          if (questions.some(q => q.questionNumber === questionNumber)) return;

          const content = $(groupEl).find('.test-panel__question-sm-title, .question-sm-title').text().trim() || `Question ${questionNumber}`;

          const optionsList: string[] = [];
          $(groupEl).find('label, .test-panel__answer-item, .choice').each((_, labelEl) => {
            const labelText = $(labelEl).text().trim();
            if (labelText) {
              optionsList.push(labelText);
            }
          });

          let answer = '';
          const checkedInput = $(groupEl).find('input:checked, input[checked], input.correct, input.active');
          if (checkedInput.length > 0) {
            answer = checkedInput.val() as string || checkedInput.parent().text().trim().substring(0, 1);
          }
          if (!answer) {
            const siblingAnswer = $(groupEl).find('.correct-answer, .answer-key, .solution');
            if (siblingAnswer.length > 0) {
              answer = siblingAnswer.text().trim();
            }
          }

          questions.push({
            questionNumber,
            type: 'MULTIPLE_CHOICE',
            content,
            options: optionsList.length > 0 ? optionsList : null,
            answer: answer.trim() || 'A',
            explanation: $(groupEl).find('.explanation, .explanation-content').text().trim() || null,
          });
        });
      }

      // Sort questions by questionNumber
      questions.sort((a, b) => a.questionNumber - b.questionNumber);

      sections.push({
        sectionOrder: order,
        title,
        passageText,
        questions,
      });
    });
  } else {
    console.log('No section.test-contents.ckeditor-wrapper elements found, falling back to generic containers...');
    const bodyContent = $('main, article, .content-wrapper').html() || $('body').html() || '';
    sections.push({
      sectionOrder: 1,
      title: 'Passage 1',
      passageText: bodyContent,
      questions: []
    });
  }

  return {
    title: testTitle,
    description: `Scraped from IELTS Online Tests: ${testTitle}`,
    type: 'READING',
    duration: 60,
    sections,
    sourceUrl,
  };
}

/**
 * Scrape a single URL (either next data or html parsing)
 */
async function scrapeUrl(url: string): Promise<RawTest | null> {
  console.log(`\nFetching: ${url}`);
  try {
    const response = await axios.get(url, { headers: HEADERS, timeout: 15000 });
    const html = response.data;
    
    // 1. Try Next.js structure parsing first (extremely clean & holds answers)
    let test = parseNextData(html);
    
    // 2. Fallback to selector DOM parsing
    if (!test) {
      console.log('NextJS structured script not found, falling back to DOM parsing...');
      test = parseDomHtml(html, url);
    }
    
    if (test) {
      test.sourceUrl = url;
    }
    
    return test;
  } catch (error: any) {
    console.error(`Failed to scrape ${url}:`, error.message);
    if (error.response && error.response.status === 403) {
      console.error('IP blocked (403 Forbidden). Try copying raw HTML to the data/raw_html/ folder to use Local Mode (--local).');
    }
    return null;
  }
}

/**
 * Parse locally saved HTML files (for bypassing Cloudflare/Bot-blockers)
 */
async function runLocalScraper() {
  console.log('=== Running Local HTML Scraper ===');
  const files = await fs.readdir(LOCAL_HTML_DIR);
  const htmlFiles = files.filter((f) => f.endsWith('.html') || f.endsWith('.htm'));
  
  if (htmlFiles.length === 0) {
    console.log(`No HTML files found in: ${LOCAL_HTML_DIR}`);
    console.log('To use Local Mode, save pages as HTML in your browser and put them in this folder.');
    return;
  }

  const scrapedExams: RawTest[] = [];

  for (const file of htmlFiles) {
    const filePath = path.join(LOCAL_HTML_DIR, file);
    console.log(`Parsing local file: ${file}`);
    try {
      const html = await fs.readFile(filePath, 'utf-8');
      
      // Try NextJS script JSON parser first
      let test = parseNextData(html);
      
      // Fallback to DOM parsing
      if (!test) {
        test = parseDomHtml(html, `local://${file}`);
      }
      
      if (test) {
        test.title = test.title || path.basename(file, path.extname(file));
        scrapedExams.push(test);
        console.log(`Successfully parsed: "${test.title}" (${test.sections.length} sections, ${test.sections.reduce((acc, s) => acc + s.questions.length, 0)} questions)`);
      }
    } catch (err: any) {
      console.error(`Error parsing file ${file}:`, err.message);
    }
  }

  if (scrapedExams.length > 0) {
    await saveScrapedExams(scrapedExams);
  }
}

/**
 * Discovers reading test URLs from list page
 */
async function discoverTestUrls(listUrl: string): Promise<string[]> {
  console.log(`Discovering test links from: ${listUrl}`);
  try {
    const response = await axios.get(listUrl, { headers: HEADERS });
    const $ = cheerio.load(response.data);
    const urls: string[] = [];

    // Look for links that point to reading tests
    $('a').each((_, el) => {
      const href = $(el).attr('href');
      if (href) {
        let fullUrl = href;
        if (href.startsWith('/')) {
          fullUrl = `https://ieltsonlinetests.com${href}`;
        }
        
        // Filter for URLs containing reading practice tests
        if (fullUrl.includes('reading-practice-test') && !urls.includes(fullUrl)) {
          urls.push(fullUrl);
        }
      }
    });

    console.log(`Found ${urls.length} candidate Reading Test URLs.`);
    return urls;
  } catch (error: any) {
    console.error(`Failed to discover URLs from ${listUrl}:`, error.message);
    return [];
  }
}

/**
 * Main Scraper Runner
 */
async function main() {
  const args = process.argv.slice(2);
  const isLocalMode = args.includes('--local');
  const targetUrlIdx = args.indexOf('--url');
  const targetUrl = targetUrlIdx !== -1 ? args[targetUrlIdx + 1] : null;
  const listUrlIdx = args.indexOf('--list');
  const listUrl = listUrlIdx !== -1 ? args[listUrlIdx + 1] : null;

  if (isLocalMode) {
    await runLocalScraper();
    return;
  }

  // Define seed target URLs if none provided
  let urlsToScrape: string[] = [];
  
  if (targetUrl) {
    urlsToScrape.push(targetUrl);
  } else if (listUrl) {
    urlsToScrape = await discoverTestUrls(listUrl);
  } else {
    // Default fallback listing pages or seed pages
    console.log('No parameters passed. Scraping default seed URL list...');
    urlsToScrape = [
      'https://ieltsonlinetests.com/ielts-recent-actual-test-answers-volume-1-reading-practice-test-1',
    ];
  }

  const tracker = await getTracker();
  const scrapedExams: RawTest[] = [];

  for (const url of urlsToScrape) {
    if (tracker.includes(url)) {
      console.log(`Skipping previously scraped URL (Deduplication): ${url}`);
      continue;
    }

    const test = await scrapeUrl(url);
    if (test) {
      scrapedExams.push(test);
      await saveToTracker(url);
      console.log(`Successfully scraped: "${test.title}"`);
    }

    // Polite delay (throttling) between crawls to prevent IP blocks
    if (urlsToScrape.length > 1) {
      console.log('Throttling: Waiting 3 seconds before next request...');
      await sleep(3000);
    }
  }

  if (scrapedExams.length > 0) {
    await saveScrapedExams(scrapedExams);
  } else {
    console.log('No new tests scraped.');
  }
}

main().catch((err) => {
  console.error('Fatal Scraper Error:', err);
});
