require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || "development";

// Middleware
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin:
      NODE_ENV === "production"
        ? process.env.FRONTEND_URL_PRODUCTION
        : process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
  // Allow both websocket and polling transports
  transports: ["websocket", "polling"],
});

// ── HTTP Health check ──────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  const rooms = [];
  io.sockets.adapter.rooms.forEach((_, key) => rooms.push(key));
  res.json({
    status: "OK",
    timestamp: new Date(),
    connected_clients: io.engine.clientsCount,
    rooms,
  });
});

// ── HTTP trigger from PHP backend (fallback if needed) ─────────────────────────
app.post("/trigger-order", (req, res) => {
  console.log("📦 HTTP trigger received from PHP backend → broadcasting refresh_kitchen");
  io.emit("refresh_kitchen");
  res.json({ success: true, message: "Kitchen refreshed via HTTP trigger" });
});

// ── Socket.io events ───────────────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`👤 Client connected: ${socket.id}`);

  // Client joins a named room (e.g. "kitchen")
  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`📋 ${socket.id} joined room: "${room}"`);
  });

  // 🔥 Kitchen changed an order status (Cooking / Ready / Delivered)
  // Dispatcher listens to refresh_kitchen to show newly Ready delivery orders
  socket.on("order_status_changed", () => {
    console.log(`🍳 Order status changed by kitchen ${socket.id} → notifying dispatcher`);
    io.emit("refresh_kitchen"); // Dispatcher + any admin panels refresh
  });

  // 🔥 Rider completed a delivery → update dispatcher immediately
  socket.on("order_delivered", () => {
    console.log(`✅ Order delivered by rider ${socket.id} → refreshing dispatcher`);
    io.emit("refresh_kitchen");    // Dispatcher re-fetches all orders (Dispatched trip disappears)
    io.emit("refresh_rider_list"); // Rider shows as Available again
  });

  // 🔥 NEW ORDER from customer website or cashier POS
  socket.on("new_order_placed", () => {
    console.log(`📢 new_order_placed from ${socket.id} → broadcasting to kitchen & dispatcher`);
    io.emit("refresh_kitchen"); // Kitchen + Dispatcher both listen to this
  });

  // Dispatcher assigns order to rider → notify all riders
  socket.on("trigger_rider_assignment", () => {
    console.log("📬 Rider assignment triggered → notifying riders");
    io.emit("refresh_rider");          // Rider portal listens
    io.emit("refresh_rider_list");     // Dispatcher rider list refreshes
  });

  // Rider status changes (online/offline/complete delivery)
  socket.on("rider_status_update", () => {
    console.log("🚴 Rider status updated → refreshing dispatcher");
    io.emit("refresh_rider_list");     // Dispatcher updates rider availability
    io.emit("refresh_kitchen");        // Admin orders panel update
  });

  // Rider location update
  socket.on("rider_location_update", () => {
    io.emit("refresh_rider_location"); // Map updates (if used)
  });

  socket.on("disconnect", (reason) => {
    console.log(`👋 Client disconnected: ${socket.id} — reason: ${reason}`);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Socket Server running on port ${PORT} [${NODE_ENV}]`);
  console.log(
    `   CORS Origin: ${
      NODE_ENV === "production"
        ? process.env.FRONTEND_URL_PRODUCTION
        : process.env.FRONTEND_URL || "*"
    }`
  );
});
