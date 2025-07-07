const userRoutes = require("./routes/userRoutes");
const msgRoutes = require("./routes/messagesRoute");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const messageModel = require("./model/MessageModel");
const socket = require("socket.io");
//const host = "http://localhost:3000"
const host = "https://chatapp-river-waves.vercel.app"


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
