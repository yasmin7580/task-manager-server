import { Router } from "express";
import prisma from "../lib/prisma";

const router = Router();
const validStatuses = new Set(["todo", "in-progress", "done"]);
function isNonEmptyString(value: unknown): value is string {
    return typeof value === "string" && value.trim().length > 0;
}

function getTaskInput(body: unknown) {
    const input = body as Record<string, unknown>;
    const title = input.title;
    const description = input.description;
    const status = input.status;

    if (!isNonEmptyString(title) || !isNonEmptyString(description) || !isNonEmptyString(status)) {
        return { error: "title, description, and status are required." };
    }

    if (!validStatuses.has(status)) {
        return { error: "status must be one of: todo, in-progress, done." };
    }

    return { data: { title: title.trim(), description: description.trim(), status } };
}

router.get("/", async (_req, res, next) => {
    try {
        const data = await prisma.task.findMany({ orderBy: { title: "asc" } });
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

router.get("/:id", async (req, res, next) => {
    try {
        const data = await prisma.task.findUnique({ where: { id: req.params.id } });
        if (!data) {
            return res.status(404).json({ success: false, message: "Task not found." });
        }
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

router.post("/", async (req, res, next) => {
    try {
        const input = getTaskInput(req.body);
        if ("error" in input) {
            return res.status(400).json({ success: false, message: input.error });
        }
        const data = await prisma.task.create({ data: input.data });
        res.status(201).json({
            success: true,
            message: "Task created.",
            data
        });
    } catch (error) {
        next(error);
    }
});

router.patch("/:id", async (req, res, next) => {
    try {
        const input = getTaskInput(req.body);
        if ("error" in input) {
            return res.status(400).json({ success: false, message: input.error });
        }
        const data = await prisma.task.update({ where: { id: req.params.id }, data: input.data });
        res.json({ success: true, message: "Task updated.", data });
    } catch (error) {
        next(error);
    }
});

router.delete("/:id", async (req, res, next) => {
    try {
        await prisma.task.delete({ where: { id: req.params.id } });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

export default router;
