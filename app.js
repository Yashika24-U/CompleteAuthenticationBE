const express = require("express")
const app  =  express()
require("dotenv").config();
require("./db/conn")
const router  = require("./routes/router")
const cors = require("cors")
const cookiParser  = require("cookie-parser")
const port = 8009


// app.get("/",(req,res)=>{
//     res.status(201).json("server created")
// })

app.use(express.json());
app.use(cookiParser())
app.use(cors())
app.use(router)


app.listen(port,()=>console.log(`Server started at portnumber,${port}`))