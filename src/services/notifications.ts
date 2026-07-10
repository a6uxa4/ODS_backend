import { env } from "../config/env.js";

let bot: { telegram: { sendMessage: (chatId: string, text: string, extra?: object) => Promise<unknown> } } | null = null;

export function setTelegramBot(instance: typeof bot) {
  bot = instance;
}

export async function notifyStaffAboutApplication(application: {
  fullName: string;
  phone: string;
  email?: string;
  message?: string;
  source?: string;
}) {
  if (!bot || !env.telegramStaffChatId) return;

  const text = [
    "📩 Новая заявка от абитуриента",
    "",
    `Имя: ${application.fullName}`,
    `Телефон: ${application.phone}`,
    application.email ? `Email: ${application.email}` : null,
    application.message ? `Сообщение: ${application.message}` : null,
    `Источник: ${application.source || "website"}`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await bot.telegram.sendMessage(env.telegramStaffChatId, text);
  } catch (error) {
    console.error("Failed to notify staff via Telegram:", error);
  }
}
