import { Router } from "express";
import { z } from "zod";
import {
  News,
  Announcement,
  Event,
  Application,
  AlumniStory,
  GalleryItem,
  SocialPost,
  SiteContent,
} from "../models/index.js";
import { authRequired } from "../middleware/auth.js";
import { notifyStaffAboutApplication } from "../services/notifications.js";

const router = Router();

const localizedSchema = z.object({
  kg: z.string().optional(),
  ru: z.string().optional(),
  en: z.string().optional(),
});

type CrudModel = {
  find: (filter?: object) => { sort: (sort: object) => { limit?: (n: number) => Promise<unknown[]> } | Promise<unknown[]> };
  findById: (id: string) => Promise<unknown | null>;
  create: (data: object) => Promise<unknown>;
  findByIdAndUpdate: (id: string, data: object, opts: object) => Promise<unknown | null>;
  findByIdAndDelete: (id: string) => Promise<unknown | null>;
};

function crudRouter(
  Model: CrudModel,
  createSchema: z.ZodObject<z.ZodRawShape>,
) {
  const r = Router();
  const updateSchema = createSchema.partial();

  r.get("/", async (_req, res) => {
    const items = await Model.find({ published: true }).sort({ createdAt: -1 });
    res.json(items);
  });

  r.get("/all", authRequired, async (_req, res) => {
    const items = await Model.find().sort({ createdAt: -1 });
    res.json(items);
  });

  r.get("/:id", async (req, res) => {
    const item = await Model.findById(String(req.params.id));
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  });

  r.post("/", authRequired, async (req, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const item = await Model.create(parsed.data);
    res.status(201).json(item);
  });

  r.put("/:id", authRequired, async (req, res) => {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const item = await Model.findByIdAndUpdate(String(req.params.id), parsed.data, {
      new: true,
    });
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  });

  r.delete("/:id", authRequired, async (req, res) => {
    const item = await Model.findByIdAndDelete(String(req.params.id));
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  });

  return r;
}

router.get("/homepage", async (_req, res) => {
  const [featuredNews, announcements, upcomingEvents, hero] = await Promise.all([
    News.find({ published: true, featured: true })
      .sort({ publishedAt: -1 })
      .limit(3),
    Announcement.find({ published: true }).sort({ priority: -1, createdAt: -1 }).limit(5),
    Event.find({ published: true, startDate: { $gte: new Date() } })
      .sort({ startDate: 1 })
      .limit(5),
    SiteContent.findOne({ key: "homepage_hero" }),
  ]);

  res.json({ featuredNews, announcements, upcomingEvents, hero: hero?.value ?? null });
});

router.get("/students-page", async (_req, res) => {
  const [vision, events, gallery, alumni, social, joinInfo, contactsDoc] =
    await Promise.all([
    SiteContent.findOne({ key: "students_vision" }),
    Event.find({ published: true }).sort({ startDate: 1 }).limit(20),
    GalleryItem.find({ published: true }).sort({ order: 1, createdAt: -1 }).limit(12),
    AlumniStory.find({ published: true }).sort({ order: 1, createdAt: -1 }),
    SocialPost.find({ published: true }).sort({ publishedAt: -1 }).limit(6),
    SiteContent.findOne({ key: "students_join" }),
    SiteContent.findOne({ key: "site_contacts" }),
  ]);

  res.json({
    vision: vision?.value ?? null,
    events,
    gallery,
    alumni,
    social,
    joinInfo: joinInfo?.value ?? null,
    contacts: contactsDoc?.value ?? null,
  });
});

router.use(
  "/news",
  crudRouter(
    News as unknown as CrudModel,
    z.object({
      title: localizedSchema,
      excerpt: localizedSchema,
      content: localizedSchema,
      imageUrl: z.string().optional(),
      featured: z.boolean().optional(),
      published: z.boolean().optional(),
      publishedAt: z.coerce.date().optional(),
    }),
  ),
);

router.use(
  "/announcements",
  crudRouter(
    Announcement as unknown as CrudModel,
    z.object({
      title: localizedSchema,
      body: localizedSchema,
      link: z.string().optional(),
      priority: z.number().optional(),
      published: z.boolean().optional(),
      expiresAt: z.coerce.date().optional(),
    }),
  ),
);

router.use(
  "/events",
  crudRouter(
    Event as unknown as CrudModel,
    z.object({
      title: localizedSchema,
      description: localizedSchema,
      location: localizedSchema.optional(),
      startDate: z.coerce.date(),
      endDate: z.coerce.date().optional(),
      imageUrl: z.string().optional(),
      published: z.boolean().optional(),
    }),
  ),
);

router.use(
  "/alumni",
  crudRouter(
    AlumniStory as unknown as CrudModel,
    z.object({
      name: localizedSchema,
      role: localizedSchema,
      story: localizedSchema,
      imageUrl: z.string().optional(),
      graduationYear: z.number().optional(),
      published: z.boolean().optional(),
      order: z.number().optional(),
    }),
  ),
);

router.use(
  "/gallery",
  crudRouter(
    GalleryItem as unknown as CrudModel,
    z.object({
      title: localizedSchema.optional(),
      imageUrl: z.string(),
      category: z.enum(["memories", "campus", "events", "students"]).optional(),
      published: z.boolean().optional(),
      order: z.number().optional(),
    }),
  ),
);

router.use(
  "/social",
  crudRouter(
    SocialPost as unknown as CrudModel,
    z.object({
      platform: z.enum(["instagram", "facebook"]),
      postUrl: z.string().url(),
      imageUrl: z.string().optional(),
      caption: localizedSchema.optional(),
      published: z.boolean().optional(),
      publishedAt: z.coerce.date().optional(),
    }),
  ),
);

router.get("/content", authRequired, async (_req, res) => {
  const items = await SiteContent.find();
  res.json(Object.fromEntries(items.map((item) => [item.key, item.value])));
});

router.get("/content/:key", async (req, res) => {
  const item = await SiteContent.findOne({ key: req.params.key });
  res.json(item?.value ?? null);
});

router.put("/content/:key", authRequired, async (req, res) => {
  const item = await SiteContent.findOneAndUpdate(
    { key: req.params.key },
    { key: req.params.key, value: req.body },
    { upsert: true, new: true },
  );
  res.json(item.value);
});

router.get("/applications", authRequired, async (_req, res) => {
  const items = await Application.find().sort({ createdAt: -1 });
  res.json(items);
});

router.post("/applications", async (req, res) => {
  const schema = z.object({
    fullName: z.string().min(2),
    phone: z.string().min(5),
    email: z.union([z.string().email(), z.literal("")]).optional(),
    message: z.string().optional(),
    source: z.enum(["website", "telegram"]).optional(),
    telegramUserId: z.string().optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  try {
    const application = await Application.create({
      ...parsed.data,
      email: parsed.data.email || "",
      message: parsed.data.message || "",
      source: parsed.data.source || "website",
    });

    await notifyStaffAboutApplication(application);

    res.status(201).json({ ok: true, id: application._id });
  } catch (error) {
    console.error("Application create failed:", error);
    res.status(500).json({ error: "Не удалось сохранить заявку" });
  }
});

router.patch("/applications/:id", authRequired, async (req, res) => {
  const schema = z.object({
    status: z.enum(["new", "reviewing", "accepted", "rejected"]),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const item = await Application.findByIdAndUpdate(req.params.id, parsed.data, {
    new: true,
  });
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});

export default router;
