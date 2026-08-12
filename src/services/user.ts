import { Router } from "express";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma";
import { AuthRequest, createToken, requireAuth } from "../middleware/auth";

const router = Router();

function publicUser(user: { id: string; name: string; email: string }) {
  return { id: user.id, name: user.name, email: user.email };
}

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body as Record<string, unknown>;
    if (typeof name !== "string" || !name.trim() || typeof email !== "string" || !email.trim() || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ success: false, message: "Name, email, and a password of at least 6 characters are required." });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) return res.status(409).json({ success: false, message: "An account with this email already exists." });

    const user = await prisma.user.create({
      data: { name: name.trim(), email: normalizedEmail, password: await bcrypt.hash(password, 12) },
      select: { id: true, name: true, email: true },
    });
    res.status(201).json({ success: true, message: "Account created.", data: { user: publicUser(user), token: createToken(user.id) } });
  } catch (error) { next(error); }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body as Record<string, unknown>;
    if (typeof email !== "string" || typeof password !== "string") return res.status(400).json({ success: false, message: "Email and password are required." });
    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ success: false, message: "Incorrect email or password." });
    res.json({ success: true, data: { user: publicUser(user), token: createToken(user.id) } });
  } catch (error) { next(error); }
});

router.get("/me", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId }, select: { id: true, name: true, email: true } });
    if (!user) return res.status(401).json({ success: false, message: "Account not found." });
    res.json({ success: true, data: publicUser(user) });
  } catch (error) { next(error); }
});

export default router;
