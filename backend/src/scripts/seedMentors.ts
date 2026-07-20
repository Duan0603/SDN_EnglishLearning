import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleProfiles = [
  {
    expertise: 'IELTS Speaking, Speaking Part 2 & 3, Pronunciation & Intonation, Band 8.5',
    bio: 'Chuyên gia luyện thi IELTS Speaking với 6+ năm kinh nghiệm. Đã hướng dẫn hơn 500+ học viên đạt band Speaking 7.0 - 8.5. Phương pháp giảng dạy tập trung sửa chi tiết ngữ điệu phát âm, tăng phản xạ tự nhiên và mở rộng tư duy trả lời câu hỏi.',
  },
  {
    expertise: 'IELTS Writing Task 1 & 2, Essay Structure, Lexical Resource, Band 8.5',
    bio: 'Giảng viên IELTS với 8 năm kinh nghiệm, sở hữu IELTS Overall 8.5 (Writing 8.5). Chuyên đào tạo kỹ năng Writing Task 2 nâng cao, lập dàn ý logic, phát triển ý tưởng mạch lạc và nâng cấp vốn từ vựng học thuật chuẩn Cambridge.',
  },
  {
    expertise: 'IELTS Reading & Listening Strategies, Vocabulary Building, Band 8.0+',
    bio: 'Chuyên gia chiến thuật giải đề IELTS Reading & Listening. Giúp học viên nắm vững kỹ thuật Skimming/Scanning, quản lý thời gian thi tối ưu và bổ sung vốn từ vựng đồng nghĩa (Paraphrasing) hiệu quả nhất.',
  },
  {
    expertise: 'IELTS General & Academic 4 Skills, Foundation & Intensive Prep',
    bio: 'Giảng viên chứng chỉ TESOL quốc tế với phong cách truyền cảm hứng. Chuyên đồng hành cùng học viên mất gốc và cần đạt mục tiêu band 6.5 - 7.5 trong thời gian ngắn.',
  },
];

async function main() {
  console.log('🌱 Updating mentor sample profiles in MongoDB...');
  const mentors = await prisma.user.findMany({
    where: { role: 'MENTOR' },
  });

  console.log(`Found ${mentors.length} mentors.`);

  for (let i = 0; i < mentors.length; i++) {
    const mentor = mentors[i];
    const profile = sampleProfiles[i % sampleProfiles.length];

    await prisma.user.update({
      where: { id: mentor.id },
      data: {
        expertise: profile.expertise,
        bio: profile.bio,
      },
    });

    console.log(`✅ Updated mentor: ${mentor.fullName || mentor.username || mentor.email}`);
  }

  console.log('🎉 Mentor profiles updated successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
