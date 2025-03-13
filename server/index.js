const userRoutes = require("./routes/userRoutes");
const msgRoutes = require("./routes/messagesRoute");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const socket = require("socket.io");


const app = express();
require("dotenv").config();

// CORS Middleware
app.use(
    cors({
        origin: "http://localhost:3000", // Allow requests from this origin
        credentials: true, // Allow credentials
    })
);

app.use(express.json());

// Routes
app.use("/api/auth", userRoutes);
app.use("/api/messages", msgRoutes);

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
        origin: "http://localhost:3000", // Remove the trailing slash
        credentials: true,
    },
});

global.onlineUsers = new Map();

io.on("connection", (socket) => {
    global.chatSocket = socket;
    socket.on("add-user", (userId) => {
        onlineUsers.set(userId, socket.id);
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
            });
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
