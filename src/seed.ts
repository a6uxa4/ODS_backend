import bcrypt from "bcryptjs";
import { connectDb } from "./config/db.js";
import { env } from "./config/env.js";
import { User } from "./models/index.js";
import {
  News,
  Announcement,
  Event,
  AlumniStory,
  GalleryItem,
  SocialPost,
  SiteContent,
} from "./models/index.js";

async function seed() {
  await connectDb();

  const existingAdmin = await User.findOne({ email: env.adminEmail });
  if (!existingAdmin) {
    await User.create({
      email: env.adminEmail,
      passwordHash: await bcrypt.hash(env.adminPassword, 10),
      name: "Administrator",
      role: "admin",
    });
    console.log(`Admin created: ${env.adminEmail}`);
  }

  if ((await News.countDocuments()) === 0) {
    await News.create({
      title: {
        kg: "Жаңы окуу жылы башталды",
        ru: "Начался новый учебный год",
        en: "New academic year has begun",
      },
      excerpt: {
        kg: "ОДС студенттери жаңы сезондо Библия, теология жана практикалык кызмат боюнча окутууга кайтышты.",
        ru: "Студенты ОДС вернулись к обучению по Библии, теологии и практическому служению.",
        en: "UTS students returned to study Scripture, theology, and practical ministry.",
      },
      content: {
        kg: "Жаңы окуу жылы студенттер үчүн мол мүмкүнчүлүктөр менен башталды.",
        ru: "Новый учебный год начался с богатыми возможностями для студентов.",
        en: "The new academic year began with rich opportunities for students.",
      },
      featured: true,
      published: true,
    });

    await Announcement.create({
      title: {
        kg: "Кабыл алуу ачык",
        ru: "Приём абитуриентов открыт",
        en: "Admissions are open",
      },
      body: {
        kg: "2026-2027 окуу жылына арыздарды кабыл алабыз.",
        ru: "Принимаем заявки на 2026–2027 учебный год.",
        en: "We are accepting applications for 2026–2027.",
      },
      priority: 10,
      published: true,
    });

    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    await Event.create({
      title: {
        kg: "Студенттер форуму",
        ru: "Студенческий форум",
        en: "Student Forum",
      },
      description: {
        kg: "Студенттер арасындагы мамлекеттик форум.",
        ru: "Общественный форум среди студентов.",
        en: "Community forum among students.",
      },
      location: {
        kg: "Бишкек, ОДС кампусу",
        ru: "Бишкек, кампус ОДС",
        en: "Bishkek, UTS campus",
      },
      startDate: nextMonth,
      published: true,
    });

    await AlumniStory.create({
      name: { kg: "Азамат Б.", ru: "Азамат Б.", en: "Azamat B." },
      role: {
        kg: "Жергиликтүү церквинин пастору",
        ru: "Пастор местной церкви",
        en: "Pastor of a local church",
      },
      story: {
        kg: "ОДС мага Иисустун мисалы боюнча кызмат кылууга негиз берди.",
        ru: "ОДС дала мне основу служить по примеру Иисуса.",
        en: "UTS gave me a foundation to serve following Jesus' example.",
      },
      graduationYear: 2022,
      published: true,
      order: 1,
    });

    await GalleryItem.create({
      title: {
        kg: "Студенттер жыйындысы",
        ru: "Студенческая встреча",
        en: "Student gathering",
      },
      imageUrl: "/UTS_logo_EN.jpg",
      category: "students",
      published: true,
    });

    await SocialPost.create({
      platform: "instagram",
      postUrl: "https://instagram.com/",
      caption: {
        kg: "Студенттердин күнү",
        ru: "День студентов",
        en: "Student day",
      },
      published: true,
    });

    await SiteContent.create({
      key: "homepage_hero",
      value: {
        title: {
          kg: "Бириккен Рухий Семинариясы",
          ru: "Объединённая Духовная Семинария",
          en: "United Theological Seminary",
        },
        subtitle: {
          kg: "Кудай сүй, жаша, кызмат кыл!",
          ru: "Люби, живи, служи как Иисус!",
          en: "Love, live, serve like Jesus!",
        },
        tagline: {
          kg: "BISHKEK 2026 — ОДС",
          ru: "BISHKEK 2026 — ОДС",
          en: "BISHKEK 2026 — UTS",
        },
      },
    });

    await SiteContent.create({
      key: "students_vision",
      value: {
        mission: {
          kg: "Иисустун мисалы боюнча рухий лидерлерди даярдоо.",
          ru: "Готовить духовных лидеров по примеру Иисуса.",
          en: "Prepare spiritual leaders following Jesus' example.",
        },
        vision: {
          kg: "Кыргызстанда жана региондо кызмат кылган бириккен коом.",
          ru: "Единое сообщество, служащее в Кыргызстане и регионе.",
          en: "A united community serving in Kyrgyzstan and the region.",
        },
      },
    });

    await SiteContent.create({
      key: "students_join",
      value: {
        steps: {
          kg: ["Сайт аркылуу арыз бериңиз", "Маектешүүгө катышыңыз", "Окууга кошулуңуз"],
          ru: ["Подайте заявку на сайте", "Пройдите собеседование", "Начните обучение"],
          en: ["Apply on the website", "Attend an interview", "Begin your studies"],
        },
      },
    });

    await SiteContent.create({
      key: "site_contacts",
      value: {
        phone: "+996 XXX XXX XXX",
        email: "info@uts.kg",
        telegram: "@uts_bot",
        address: {
          kg: "Бишкек, Кыргызстан",
          ru: "Бишкек, Кыргызстан",
          en: "Bishkek, Kyrgyzstan",
        },
        instagram: "https://instagram.com/",
        facebook: "https://facebook.com/",
      },
    });

    console.log("Sample content seeded");
  }

  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
