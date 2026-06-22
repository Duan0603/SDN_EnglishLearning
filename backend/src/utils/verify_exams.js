const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  console.log("=== Verifying Database Exams ===");
  const exams = await prisma.test.findMany({
    include: {
      sections: {
        include: {
          questions: true
        }
      }
    }
  });
  
  console.log(`Total tests in database: ${exams.length}`);
  for (const exam of exams) {
    let qCount = 0;
    exam.sections.forEach(s => {
      if (s.questions) {
        qCount += s.questions.length;
      }
    });
    console.log(`- [${exam.type}] "${exam.title}" (${exam.sections.length} sections, ${qCount} questions)`);
  }
}

verify()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
