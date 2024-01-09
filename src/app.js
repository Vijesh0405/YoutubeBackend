import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "50kb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "50kb" }));
app.use(express.static("public"));

//routes import
import {
  userRouter,
  videoRouter,
  subscriptionRouter,
  healthcheckRouter,
  likeRouter,
  commentRouter,
  playlistRouter,
  tweetRouter,
  dashboardRouter,
} from "./routes/index.js";
//routes declaration
app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/dashboard", dashboardRouter)

export { app };
