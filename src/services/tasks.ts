import { Router } from "express";
import prisma from "../lib/prisma";
import { AuthRequest, requireAuth } from "../middleware/auth";

const router = Router();
const validStatuses = new Set(["pending", "completed"]);
const validText = (value: unknown) => typeof value === "string" && value.trim().length > 0;

function getTaskInput(body: Record<string, unknown>, partial = false) {
  const { title, description, status } = body;
  if (!partial && !validText(title)) return { error: "A task title is required." };
  if (title !== undefined && !validText(title)) return { error: "A task title is required." };
  if (description !== undefined && typeof description !== "string") return { error: "Description must be text." };
  if (status !== undefined && (typeof status !== "string" || !validStatuses.has(status))) return { error: "Status must be pending or completed." };
  return { data: { ...(title !== undefined ? { title: (title as string).trim() } : {}), ...(description !== undefined ? { description: (description as string).trim() } : {}), ...(status !== undefined ? { status } : {}) } };
}

router.use(requireAuth);

router.get("/", async (req: AuthRequest, res, next) => {
  try {
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const status = typeof req.query.status === "string" && validStatuses.has(req.query.status) ? req.query.status : undefined;
    const data = await prisma.task.findMany({ where: { userId: req.userId, ...(status ? { status } : {}), ...(search ? { title: { contains: search, mode: "insensitive" } } : {}) }, orderBy: { createdAt: "desc" } });
    res.json({ success: true, data });
  } catch (error) { next(error); }
});

router.post("/", async (req: AuthRequest, res, next) => {
  try {
    const input = getTaskInput(req.body);
    if ("error" in input) return res.status(400).json({ success: false, message: input.error });
    const data = await prisma.task.create({ data: { title: input.data.title!, status: (input.data.status as string) || "pending", description: input.data.description || "", userId: req.userId! } });
    res.status(201).json({ success: true, message: "Task created.", data });
  } catch (error) { next(error); }
});

router.patch("/:id", async (req: AuthRequest, res, next) => {
  try {
    const input = getTaskInput(req.body, true);
    if ("error" in input) return res.status(400).json({ success: false, message: input.error });
    const task = await prisma.task.findFirst({ where: { id: String(req.params.id), userId: req.userId } });
    if (!task) return res.status(404).json({ success: false, message: "Task not found." });
    const data = await prisma.task.update({ where: { id: task.id }, data: input.data });
    res.json({ success: true, message: "Task updated.", data });
  } catch (error) { next(error); }
});

router.delete("/:id", async (req: AuthRequest, res, next) => {
  try {
    const result = await prisma.task.deleteMany({ where: { id: String(req.params.id), userId: req.userId } });
    if (!result.count) return res.status(404).json({ success: false, message: "Task not found." });
    res.json({ success: true, message: "Task deleted." });
  } catch (error) { next(error); }
});

export default router;
