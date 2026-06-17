import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model("User", userSchema);

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existing = await User.findOne({ email: "admin@school.com" });

    if (existing) {
      console.log("⚠️ Admin already exists");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    await User.create({
      fullName: "Super Admin",
      email: "admin@school.com",
      password: hashedPassword,
      role: "admin",
      isActive: true,
      isOtpVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log("✅ Admin user created successfully");
    process.exit();

  } catch (err) {
    console.log("❌ Seed error:", err.message);
    process.exit(1);
  }
}

seedAdmin();