import { Router } from "express";
import tasks from "../services/tasks";

const router = Router();

router.use("/tasks", tasks);

export default router;
