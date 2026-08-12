import dotenv from "dotenv";
import app from "./app";

dotenv.config();
const PORT = Number(process.env.PORT) || 8000;

app.listen(PORT, () => {
    console.log(`Task Manager API listening on port ${PORT}`);
});
