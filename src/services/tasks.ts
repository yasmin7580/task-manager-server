import { Router } from "express";
import prisma from "../lib/prisma";

// for post new tasks
const router = Router()
router.post("/tasks",async (req,res)=>{
    const tasks = req.body
    const data = await prisma.task.create(tasks)
    res.json({
        success:true,
        message:"Tasks Created",
        data
    })
})