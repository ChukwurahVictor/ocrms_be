// eslint-disable-next-line @typescript-eslint/no-var-requires
const dotenv = require('dotenv');
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { UserRole } from '../interfaces';

const prisma = new PrismaClient();

const promises = [];

dotenv.config();

const env = (key: string, defaultValue: any = undefined) => {
  return process.env[key] || defaultValue;
};

env.require = (key: string, defaultValue: any = undefined) => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Environment variable '${key}' is missing!`);
  }
  return value;
};

function hashpassword(password: string): any {
  return bcrypt.hash(password, 10);
}

promises.push(
  new Promise(async (res, rej) => {
    try {
      const superAdminUser = await prisma.user.upsert({
        where: { email: env('ADMIN_EMAIL') },
        update: {
          userRole: UserRole.ADMIN,
        },
        create: {
          firstName: env('ADMIN_NAME'),
          lastName: '',
          phone: '',
          email: env('ADMIN_EMAIL'),
          userRole: UserRole.ADMIN,
          password: await hashpassword(env('ADMIN_PASS')),
        },
      });
      res(true);
    } catch (e) {
      rej(e);
    }
  }),
);

Promise.all(promises)
  .then(() => {
    console.log('Database seeded successfully 👍');
    process.exit(0);
  })
  .catch((e) => {
    console.error('Error seeding database, exiting...');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
