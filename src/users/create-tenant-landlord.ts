import "reflect-metadata";
import { AppDataSource } from "../data-source";
import { User } from "./user.entity";
import { Role } from "../common/enum/role.enum";
import * as bcrypt from "bcrypt";

async function createUsers() {
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(User);

  const users = [
    { email: "landlord@test.com", password: "123456", role: Role.LANDLORD },
    { email: "tenant@test.com", password: "123456", role: Role.TENANT },
  ];

  for (const u of users) {
    const exist = await repo.findOne({ where: { email: u.email } });
    if (!exist) {
      const hashed = await bcrypt.hash(u.password, 10);
      const user = repo.create({ ...u, password: hashed });
      await repo.save(user);
      console.log(`Created ${u.role}: ${u.email}`);
    } else {
      console.log(`${u.email} already exists`);
    }
  }

  process.exit(0);
}

createUsers();