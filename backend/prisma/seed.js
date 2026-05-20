import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);

  // 1. Seed Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sdn.com' },
    update: { password },
    create: {
      email: 'admin@sdn.com',
      username: 'admin_sdn',
      fullName: 'SDN Admin',
      password: password,
      role: 'ADMIN',
      status: 'active',
      verify: true
    },
  });

  const mentor = await prisma.user.upsert({
    where: { email: 'mentor@sdn.com' },
    update: { password },
    create: {
      email: 'mentor@sdn.com',
      username: 'mentor_sdn',
      fullName: 'SDN Mentor',
      password: password,
      role: 'MENTOR',
      status: 'active',
      verify: true
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@sdn.com' },
    update: { password },
    create: {
      email: 'student@sdn.com',
      username: 'student_sdn',
      fullName: 'SDN Student',
      password: password,
      role: 'STUDENT',
      status: 'active',
      verify: true
    },
  });

  console.log('Seed: Created Users successfully.');

  // 2. Seed Availability slots for Mentor (Epic 4)
  const today = new Date();
  const startTime = new Date(today.setHours(today.getHours() + 2));
  const endTime = new Date(today.setHours(today.getHours() + 1));

  // Clean existing availabilities to avoid duplicates on multiple seeds
  await prisma.availability.deleteMany({
    where: { mentorId: mentor.id }
  });

  const availability = await prisma.availability.create({
    data: {
      mentorId: mentor.id,
      startTime: startTime,
      endTime: endTime,
      isBooked: false
    }
  });

  console.log('Seed: Created Availability slots for Mentor.');

  // 3. Seed Test & Questions (Epic 2)
  // Clean existing tests to keep seed clean
  await prisma.test.deleteMany({});

  const readingTest = await prisma.test.create({
    data: {
      title: 'IELTS Reading Mock Test 1',
      description: 'Practice Reading Passage 1 on Artificial Intelligence',
      type: 'READING',
      duration: 60,
    }
  });

  const readingSection = await prisma.testSection.create({
    data: {
      testId: readingTest.id,
      sectionOrder: 1,
      title: 'The Rise of Artificial Intelligence',
      passageText: 'Artificial Intelligence (AI) is intelligence demonstrated by machines, as opposed to natural intelligence displayed by animals including humans. Leading AI textbooks define the field as the study of intelligent agents: any system that perceives its environment and takes actions that maximize its chance of achieving its goals.',
      images: []
    }
  });

  await prisma.question.createMany({
    data: [
      {
        sectionId: readingSection.id,
        questionNumber: 1,
        type: 'MULTIPLE_CHOICE',
        content: 'What do leading AI textbooks define the field as?',
        options: [
          'The study of natural intelligence',
          'The study of intelligent agents',
          'The study of human brain structures',
          'The study of animals including humans'
        ],
        answer: 'The study of intelligent agents',
        explanation: 'According to the passage, "Leading AI textbooks define the field as the study of intelligent agents."'
      },
      {
        sectionId: readingSection.id,
        questionNumber: 2,
        type: 'TRUE_FALSE_NOT_GIVEN',
        content: 'Natural intelligence is displayed by machines.',
        options: ['TRUE', 'FALSE', 'NOT GIVEN'],
        answer: 'FALSE',
        explanation: 'The text states that natural intelligence is displayed by animals including humans, while artificial intelligence is demonstrated by machines.'
      }
    ]
  });

  const listeningTest = await prisma.test.create({
    data: {
      title: 'IELTS Listening Mock Test 1',
      description: 'General Listening Practice Section 1',
      type: 'LISTENING',
      duration: 30,
    }
  });

  const listeningSection = await prisma.testSection.create({
    data: {
      testId: listeningTest.id,
      sectionOrder: 1,
      title: 'Section 1 - Customer Service feedback',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Mock URL
      passageText: 'Please listen to the audio conversation between a customer and a service representative.'
    }
  });

  await prisma.question.createMany({
    data: [
      {
        sectionId: listeningSection.id,
        questionNumber: 1,
        type: 'FILL_IN_BLANKS',
        content: 'The customer service department is open until (1) ______ p.m.',
        answer: '8',
        explanation: 'The representative states in the audio that they are open until 8 p.m.'
      }
    ]
  });

  console.log('Seed: Created Reading and Listening practice tests & questions.');
  console.log('Seed data processed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
