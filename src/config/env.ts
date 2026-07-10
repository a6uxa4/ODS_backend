import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT) || 4000,
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ods",
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-in-production",
  corsOrigin:
    process.env.CORS_ORIGIN || "http://localhost:3000,http://127.0.0.1:3000",
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || "",
  telegramStaffChatId: process.env.TELEGRAM_STAFF_CHAT_ID || "",
  adminEmail: process.env.ADMIN_EMAIL || "admin@uts.kg",
  adminPassword: process.env.ADMIN_PASSWORD || "change-me",
};
