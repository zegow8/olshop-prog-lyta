import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Cek apakah admin sudah ada
  const adminExists = await prisma.user.findUnique({
    where: { email: 'admin@gmail.com' }
  });

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await prisma.user.create({
      data: {
        email: 'admin@gmail.com',
        password: hashedPassword,
        name: 'Admin',
        role: 'ADMIN'
      }
    });
    
    console.log('✅ Admin user created!');
    console.log('Email: admin@gmail.com');
    console.log('Password: admin123');
  } else {
    console.log('ℹ️ Admin user already exists');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });