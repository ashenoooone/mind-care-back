import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const existingServices = await prisma.service.findMany({
    where: {
      OR: [
        { name: 'Консультация психолога' },
        { name: 'Семейная терапия' },
        { name: 'Коучинг по личностному развитию' },
      ],
    },
  });

  if (existingServices.length === 0) {
    await prisma.service.createMany({
      data: [
        {
          name: 'Консультация психолога',
          description:
            'Индивидуальная встреча с психологом для обсуждения личных вопросов и проблем',
          duration: 60,
          price: 3000.0,
        },
        {
          name: 'Семейная терапия',
          description:
            'Консультация для семьи для решения межличностных конфликтов и улучшения общения',
          duration: 90,
          price: 5000.0,
        },
        {
          name: 'Коучинг по личностному развитию',
          description:
            'Помощь в достижении личных целей и повышении самооценки',
          duration: 45,
          price: 2500.0,
        },
      ],
    });
  } else {
    console.log('Услуги уже существуют в базе данных');
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
