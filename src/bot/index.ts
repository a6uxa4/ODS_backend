import { Telegraf, Markup } from "telegraf";
import { env } from "../config/env.js";
import { Application } from "../models/index.js";
import { notifyStaffAboutApplication } from "../services/notifications.js";
import { setTelegramBot } from "../services/notifications.js";

type Session = {
  step: "idle" | "name" | "phone" | "email" | "message";
  fullName?: string;
  phone?: string;
  email?: string;
};

const sessions = new Map<number, Session>();

export function startTelegramBot() {
  if (!env.telegramBotToken) {
    console.log("Telegram bot disabled: TELEGRAM_BOT_TOKEN not set");
    return null;
  }

  const bot = new Telegraf(env.telegramBotToken);
  setTelegramBot(bot);

  bot.start(async (ctx) => {
    sessions.set(ctx.from.id, { step: "idle" });
    await ctx.reply(
      "Добро пожаловать в бот Объединённой Духовной Семинарии (ОДС)!\n\n" +
        "Здесь вы можете подать заявку на обучение. Нажмите кнопку ниже, чтобы начать.",
      Markup.keyboard([["📝 Подать заявку"], ["ℹ️ О семинарии"]]).resize(),
    );
  });

  bot.hears("ℹ️ О семинарии", async (ctx) => {
    await ctx.reply(
      "Объединённая Духовная Семинария — BISHKEK 2026.\n" +
        "Сайт: http://localhost:3000\n\n" +
        "Люби, живи, служи как Иисус!",
    );
  });

  bot.hears("📝 Подать заявку", async (ctx) => {
    sessions.set(ctx.from.id, { step: "name" });
    await ctx.reply("Как вас зовут? (ФИО)");
  });

  bot.on("text", async (ctx) => {
    const session = sessions.get(ctx.from.id);
    if (!session || session.step === "idle") return;

    const text = ctx.message.text.trim();

    if (session.step === "name") {
      session.fullName = text;
      session.step = "phone";
      await ctx.reply("Укажите номер телефона:");
      return;
    }

    if (session.step === "phone") {
      session.phone = text;
      session.step = "email";
      await ctx.reply("Email (или напишите «-», чтобы пропустить):");
      return;
    }

    if (session.step === "email") {
      session.email = text === "-" ? "" : text;
      session.step = "message";
      await ctx.reply("Кратко расскажите о себе (или «-» чтобы пропустить):");
      return;
    }

    if (session.step === "message") {
      const message = text === "-" ? "" : text;

      const application = await Application.create({
        fullName: session.fullName!,
        phone: session.phone!,
        email: session.email || "",
        message,
        source: "telegram",
        telegramUserId: String(ctx.from.id),
      });

      await notifyStaffAboutApplication(application);

      sessions.set(ctx.from.id, { step: "idle" });
      await ctx.reply(
        "✅ Спасибо! Ваша заявка принята. Мы свяжемся с вами в ближайшее время.",
        Markup.keyboard([["📝 Подать заявку"], ["ℹ️ О семинарии"]]).resize(),
      );
    }
  });

  bot.launch({ dropPendingUpdates: true })
    .then(() => console.log("Telegram bot started"))
    .catch((err: { response?: { error_code?: number }; message?: string }) => {
      if (err.response?.error_code === 409) {
        console.warn(
          "Telegram bot: conflict 409 — уже работает другой экземпляр бота.\n" +
            "Остановите лишний backend (Ctrl+C в других терминалах). API продолжает работать.",
        );
        return;
      }
      console.error("Telegram bot failed to start:", err.message || err);
    });

  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));

  return bot;
}
