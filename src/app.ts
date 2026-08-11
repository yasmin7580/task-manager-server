import express, { Router } from "express"
import cors from "cors"
const app = express()
app.use(express.json())
app.use("/",Router)
app.get("/",(req,res)=>{
res.json({
    success:true,
    message:"Welcome to the server"
})
})
export default app 