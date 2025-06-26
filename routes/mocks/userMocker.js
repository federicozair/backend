import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';

export function generateUsers(count = 10) {
  return Array.from({ length: count }, () => ({
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    password: bcrypt.hashSync('123456', 10),
    role: faker.helpers.arrayElement(['user', 'admin']),
    pets: [],
  }));
}
