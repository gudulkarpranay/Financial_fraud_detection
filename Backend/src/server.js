import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

// ✅ ROUTES
import transactionRoutes from "./routes/transactionRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";
import investigationRoutes from "./routes/investigationRoutes.js";
import fundFlowRoutes from "./routes/fundFlowRoutes.js";
import demoRoutes from "./routes/demoRoutes.js"; // ✅ FIXED IMPORT
import feedbackRoutes from "./routes/feedbackRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

// ✅ KAFKA
import { startProducer } from "./kafka/producer.js";
import { startConsumer } from "./kafka/consumer.js";
import { startAlertConsumer } from "./kafka/alertConsumer.js";

dotenv.config();

// ================= DB =================
await connectDB();

// ================= APP INIT =================
const app = express();
const server = http.createServer(app);

// ================= SOCKET =================
const io = new Server(server, {
  cors: { origin: "*" },
});

// ✅ Make io globally accessible
global.io = io;

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());

// ================= ROUTES =================
app.use("/api/transactions", transactionRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/investigation", investigationRoutes);
app.use("/api/fund-flow", fundFlowRoutes);
app.use("/api/demo", demoRoutes); // ✅ DEMO MODE ROUTE
app.use("/api/feedback", feedbackRoutes);
app.use("/api/chat", chatRoutes);

// ================= SOCKET CONNECTION =================
io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// ================= START EVERYTHING =================
const startServer = async () => {
  try {
    console.log("🚀 Starting services...");

    // Kafka is optional for local demo runs.
    if (process.env.ENABLE_KAFKA === "true") {
      await Promise.all([
        startProducer(),
        startConsumer(),
        startAlertConsumer(),
      ]);
      console.log("✅ Kafka fully running");
    } else {
      console.log("⚠️ Kafka disabled (set ENABLE_KAFKA=true to enable)");
    }

    // 🚀 Start Server
    const PORT = process.env.PORT || 5000;

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Socket.IO ready`);
      console.log(`🎬 Demo endpoint: http://localhost:${PORT}/api/demo/run`);
    });

  } catch (error) {
    console.error("❌ Server startup error:", error);
    process.exit(1); // 🔥 Fail fast (important for hackathon stability)
  }
};

startServer();

// ================= EXPORT IO =================
export { io };