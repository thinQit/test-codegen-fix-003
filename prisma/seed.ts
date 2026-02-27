import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const user = await prisma.user.create({
    data: {
      name: 'Alex Rivera',
      email: 'alex@example.com',
      passwordHash
    }
  });

  await prisma.task.create({
    data: {
      userId: user.id,
      title: 'Plan weekly sprint',
      description: 'Outline goals, deliverables, and risks for the team sprint.',
      status: 'in_progress',
      priority: 'high',
      tags: JSON.stringify(['planning', 'team']),
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      isPrivate: false
    }
  });

  await prisma.task.create({
    data: {
      userId: user.id,
      title: 'Write product update',
      description: 'Draft the monthly product update for stakeholders.',
      status: 'todo',
      priority: 'medium',
      tags: JSON.stringify(['writing', 'stakeholders']),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isPrivate: true
    }
  });

  await prisma.task.create({
    data: {
      userId: user.id,
      title: 'Archive completed tickets',
      description: 'Close out completed tasks in the tracker.',
      status: 'done',
      priority: 'low',
      tags: JSON.stringify(['cleanup']),
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      isPrivate: false
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
