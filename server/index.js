import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import { Queue } from "bullmq";
import { chatController } from "./controllers/chatController.js";


const app = express();
const queue = new Queue("file-upload-queue", {
  connection: {
    host: "localhost",
    port: 6379, // must be number, not string
  },
});

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // REMOVE trailing space
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({ storage });

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  return res.json({
    status: 200,
    message: "All Good",
  });
});

app.post("/upload/pdf", upload.single("pdf"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  // Pass object directly, not JSON string
  await queue.add("file-ready", {
    filename: req.file.filename, // actual saved filename
    destination: req.file.destination, // uploads directory
    path: req.file.path, // full path on disk
  });

  return res.json({
    message: "PDF uploaded successfully",
    file: req.file,
  });
});

app.post("/chat", chatController);


const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server is listening on PORT ${PORT}`);
});
