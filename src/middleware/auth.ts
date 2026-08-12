import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export type AuthRequest = Request & { userId?: string };

const getSecret = () => process.env.JWT_SECRET || "development-only-change-this-secret";

export function createToken(userId: string) {
  return jwt.sign({ userId }, getSecret(), { expiresIn: "7d" });
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.slice(7)
    : undefined;

  if (!token) return res.status(401).json({ success: false, message: "Authentication required." });

  try {
    const payload = jwt.verify(token, getSecret()) as { userId: string };
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Your session has expired. Please log in again." });
  }
}
