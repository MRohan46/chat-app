const userRoutes = require("./routes/userRoutes");
const msgRoutes = require("./routes/messagesRoute");
const trackingRoutes = require("./routes/trackingRoute");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const messageModel = require("./model/MessageModel");
const socket = require("socket.io");
const host = "http://localhost:3000"
const fs = require("fs");
const path = require("path");
const host = "https://chatapp-river-waves.vercel.app"
const UAParser = require("ua-parser-js");
const fetch = require("node-fetch");
const EmailOpen = require("./model/EmailOpenModel");
const ClickLog = require("./model/ClickLogModel");



const app = express();
require("dotenv").config();

// CORS Middleware
app.use(
    cors({
        origin: host, // Allow requests from this origin
        credentials: true, // Allow credentials
    })
);

app.use(express.json());

// Routes
app.use("/api/auth", userRoutes);
app.use("/api/messages", msgRoutes);
app.use("/api/tracking", trackingRoutes);

// Database Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("DB Connection Successful");
}).catch((err) => {
    console.log(err.message);
});

// Start Server
const PORT = 5000; // Use Render’s port or default to 5000 for local
const server = app.listen(PORT, () =>
  console.log(`Server started on ${PORT}`)
);
// Socket.IO Configuration
const io = socket(server, {
    cors: {
        origin: host, // Remove the trailing slash
        credentials: true,
    },
});


async function getGeoData(ip) {
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}`);
    const data = await res.json();
    return {
      country: data.country,
      city: data.city,
      region: data.regionName,
      org: data.org,
    };
  } catch {
    return {};
  }
}

app.get("/track", async (req, res) => {
  const email = req.query.email;
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const userAgent = req.headers["user-agent"];
  const parser = new UAParser(userAgent);
  const emailClient = `${parser.getBrowser().name} - ${parser.getOS().name}`;

  if (email) {
    const geo = await getGeoData(ip);
    await EmailOpen.create({ email, ip, userAgent, emailClient, ...geo });
    console.log(`📩 Opened: ${email} | ${geo.city}, ${geo.country}`);
  }

  const pixelBuffer = Buffer.from("R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==", "base64");
  res.setHeader("Content-Type", "image/gif");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.send(pixelBuffer);
});

app.get("/click", async (req, res) => {
  const { email, url } = req.query;
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  if (email && url) {
    await ClickLog.create({ email, url, ip, clickedAt: new Date() });
    console.log(`🖱️ Clicked: ${email} → ${url}`);
  }
  res.redirect(url);
});

global.onlineUsers = new Map();
module.exports = { io,  onlineUsers};

io.on("connection", (socket) => {
    global.chatSocket = socket;
    socket.on("add-user", async (userId) => {
        onlineUsers.set(userId, socket.id);
    
        // ✅ Find messages sent to the user that were "not_sent"
        const markData = await messageModel.updateMany(
            { users: userId, status: "not_sent" }, 
            { $set: { status: "sent" } }
        );
    
    
        // 🔥 Emit event to the *recipient* who was already online
        onlineUsers.forEach((socketId, onlineUserId) => {
            if (onlineUserId !== userId) { // ✅ Send to others, not the logged-in user
                socket.to(socketId).emit("msg-receive", {
                    status: "sent",
                    updatedMessages: markData.modifiedCount, // ✅ Number of messages updated
                });
            }
        });
    });
    


    socket.on("disconnect", () => {
        for (let [userId, socketId] of onlineUsers) {
            if (socketId === socket.id) {
                onlineUsers.delete(userId);
                break;
            }
        }
    });

    socket.on("user-logout", (userId) => {
        onlineUsers.delete(userId);
    }); 

    socket.on("send-msg", (data) => {
        const sendUserSocket = onlineUsers.get(data.to);
        if (sendUserSocket) {
            socket.to(sendUserSocket).emit("msg-receive", {
                message: data.message,
                from: data.from, // Include the sender's ID
                replyTo: data.replyTo 
                ? { message: data.replyTo.message, sender: data.replyTo.sender } 
                : null, // ✅ Make sure replyTo has both message & sender
                messageId: data.messageId ? data.messageId : null,
                status: data.status,
            });
        }
    });

    socket.on("messages-reader", (data) => {
    
        const sendUserSocket = onlineUsers.get(data.chatId);
        if (sendUserSocket) {
    
            socket.to(sendUserSocket).emit("messages-sender", {
                from: data.chatId,
                status: data.status,
            });
        } else {
        }
    });
    

    socket.on("get-online-users", () => {
        socket.emit("online-users", Array.from(onlineUsers.keys()));
    });

    socket.on("typing", ({ senderId, receiverId }) => {
        const receiverSocket = onlineUsers.get(receiverId);
        if (receiverSocket) {
            socket.to(receiverSocket).emit("user-typing", senderId);
        }
    });
    
    socket.on("stop-typing", ({ senderId, receiverId }) => {
        const receiverSocket = onlineUsers.get(receiverId);
        if (receiverSocket) {
            socket.to(receiverSocket).emit("user-stopped-typing", senderId);
        }
    });
    

});
