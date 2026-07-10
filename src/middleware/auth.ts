import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export type AuthPayload = { userId: string; role: string };

export function authRequired(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, env.jwtSecret) as AuthPayload;
    (req as Request & { auth: AuthPayload }).auth = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

export function adminRequired(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  authRequired(req, res, () => {
    const auth = (req as Request & { auth: AuthPayload }).auth;
    if (auth.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  });
}
