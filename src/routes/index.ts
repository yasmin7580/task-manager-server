import { Router } from "express";
import tasks from "../services/tasks";
import users from "../services/user";

const router = Router();

router.use("/tasks", tasks);
router.use("/auth", users);

export default router;
