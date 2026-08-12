import cors from "cors";
import express from "express";
import router from "./routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
    res.json({ success: true, message: "Task Manager API is running." });
});

app.get("/health", (_req, res) => {
    res.json({ success: true, status: "ok" });
});

app.use("/api/v1", router);

app.use((_req, res) => {
    res.status(404).json({ success: false, message: "Route not found." });
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(error);
    const code = typeof error === "object" && error !== null && "code" in error ? error.code : undefined;
    const status = code === "P2025" ? 404 : 500;
    const message = status === 404 ? "Task not found." : "An unexpected server error occurred.";
    res.status(status).json({ success: false, message });
});

export default app;
