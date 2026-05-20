import "dotenv/config";
import express from "express";
import { transcodeRouter } from "./routes/transcode.js";

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(express.json({ limit: "1mb" }));
app.use(transcodeRouter);

app.listen(port, () => {
  console.log(`Transcoder service listening on port ${port}`);
});
