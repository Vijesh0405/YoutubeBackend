import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
const app = express()


app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))
app.use(express.json({limit:"50kb"}))
app.use(cookieParser())
app.use(express.urlencoded({extended:true,limit:"50kb"}))
app.use(express.static("public"))


//routes import
import {userRouter,videoRouter,subscriptionRouter} from './routes/index.js'
//routes declaration
app.use("/api/v1/users",userRouter)
app.use('/api/v1/video',videoRouter)
app.use('/api/v1/subscription',subscriptionRouter)




export {app}