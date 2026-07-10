import { Schema, model } from "mongoose";

const localizedStringSchema = new Schema(
  {
    kg: { type: String, default: "" },
    ru: { type: String, default: "" },
    en: { type: String, default: "" },
  },
  { _id: false },
);

export const User = model(
  "User",
  new Schema(
    {
      email: { type: String, required: true, unique: true },
      passwordHash: { type: String, required: true },
      name: { type: String, required: true },
      role: { type: String, enum: ["admin", "editor"], default: "editor" },
    },
    { timestamps: true },
  ),
);

export const News = model(
  "News",
  new Schema(
    {
      title: { type: localizedStringSchema, required: true },
      excerpt: { type: localizedStringSchema, required: true },
      content: { type: localizedStringSchema, required: true },
      imageUrl: { type: String, default: "" },
      featured: { type: Boolean, default: false },
      published: { type: Boolean, default: true },
      publishedAt: { type: Date, default: Date.now },
    },
    { timestamps: true },
  ),
);

export const Announcement = model(
  "Announcement",
  new Schema(
    {
      title: { type: localizedStringSchema, required: true },
      body: { type: localizedStringSchema, required: true },
      link: { type: String, default: "" },
      priority: { type: Number, default: 0 },
      published: { type: Boolean, default: true },
      expiresAt: { type: Date },
    },
    { timestamps: true },
  ),
);

export const Event = model(
  "Event",
  new Schema(
    {
      title: { type: localizedStringSchema, required: true },
      description: { type: localizedStringSchema, required: true },
      location: { type: localizedStringSchema, default: () => ({}) },
      startDate: { type: Date, required: true },
      endDate: { type: Date },
      imageUrl: { type: String, default: "" },
      published: { type: Boolean, default: true },
    },
    { timestamps: true },
  ),
);

export const Application = model(
  "Application",
  new Schema(
    {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, default: "" },
      message: { type: String, default: "" },
      source: { type: String, enum: ["website", "telegram"], default: "website" },
      status: {
        type: String,
        enum: ["new", "reviewing", "accepted", "rejected"],
        default: "new",
      },
      telegramUserId: { type: String, default: "" },
    },
    { timestamps: true },
  ),
);

export const AlumniStory = model(
  "AlumniStory",
  new Schema(
    {
      name: { type: localizedStringSchema, required: true },
      role: { type: localizedStringSchema, required: true },
      story: { type: localizedStringSchema, required: true },
      imageUrl: { type: String, default: "" },
      graduationYear: { type: Number },
      published: { type: Boolean, default: true },
      order: { type: Number, default: 0 },
    },
    { timestamps: true },
  ),
);

export const GalleryItem = model(
  "GalleryItem",
  new Schema(
    {
      title: { type: localizedStringSchema, default: () => ({}) },
      imageUrl: { type: String, required: true },
      category: {
        type: String,
        enum: ["memories", "campus", "events", "students"],
        default: "memories",
      },
      published: { type: Boolean, default: true },
      order: { type: Number, default: 0 },
    },
    { timestamps: true },
  ),
);

export const SocialPost = model(
  "SocialPost",
  new Schema(
    {
      platform: { type: String, enum: ["instagram", "facebook"], required: true },
      postUrl: { type: String, required: true },
      imageUrl: { type: String, default: "" },
      caption: { type: localizedStringSchema, default: () => ({}) },
      published: { type: Boolean, default: true },
      publishedAt: { type: Date, default: Date.now },
    },
    { timestamps: true },
  ),
);

export const SiteContent = model(
  "SiteContent",
  new Schema(
    {
      key: { type: String, required: true, unique: true },
      value: { type: Schema.Types.Mixed, required: true },
    },
    { timestamps: true },
  ),
);
