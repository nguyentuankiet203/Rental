import "reflect-metadata";
import { AppDataSource } from "../data-source";
import { User } from "./user.entity";
import { Role } from "../common/enum/role.enum";
import * as bcrypt from "bcrypt";

async function createAdmin() {
  try {
    await AppDataSource.initialize();

    const userRepo = AppDataSource.getRepository(User);

    const existing = await userRepo.findOne({ where: { email: "admin@system.com" } });
    if (existing) {
      console.log("Admin đã tồn tại");
      return process.exit(0);
    }

    const hashed = await bcrypt.hash("123456", 10);

    const admin = userRepo.create({
      email: "admin@system.com",
      password: hashed,
      role: Role.ADMIN,
    });

    await userRepo.save(admin);
    console.log("Admin created:", admin);
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
}

createAdmin();