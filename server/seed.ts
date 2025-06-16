import dotenv from 'dotenv';
dotenv.config();
import bcrypt from "bcrypt";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

async function seedDatabase() {
  try {
    console.log("Seeding database...");
    
    // Check if admin already exists
    const existingAdmin = await db.select().from(users).where(eq(users.email, "admin@smk.sch.id"));
    
    if (existingAdmin.length === 0) {
      // Create default admin user
      const hashedPassword = await bcrypt.hash("admin123", 10);
      
      await db.insert(users).values({
        name: "Administrator",
        email: "admin@smk.sch.id", 
        password: hashedPassword,
        role: "admin",
        nip: "ADM001",
        subject: "Administrator",
        isActive: true,
      });
      
      console.log("✓ Admin user created:");
      console.log("  Email: admin@smk.sch.id");
      console.log("  Password: admin123");
    }
    
    // Create sample teacher for testing
    const existingTeacher = await db.select().from(users).where(eq(users.email, "guru@smk.sch.id"));
    
    if (existingTeacher.length === 0) {
      const hashedPassword = await bcrypt.hash("guru123", 10);
      
      await db.insert(users).values({
        name: "Budi Santoso",
        email: "guru@smk.sch.id",
        password: hashedPassword, 
        role: "teacher",
        nip: "198501012010011001",
        subject: "Bimbingan Konseling",
        isActive: true,
      });
      
      console.log("✓ Sample teacher created:");
      console.log("  Email: guru@smk.sch.id");
      console.log("  Password: guru123");
    }
    
    console.log("Database seeding completed!");
    
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(0);
  }
}

// Run seeding if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().then(() => process.exit(0));
}

export { seedDatabase };