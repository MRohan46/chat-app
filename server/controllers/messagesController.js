const messageModel = require("../model/MessageModel");
const mongoose = require("mongoose");

module.exports.addMsg = async (req, res, next) => {
    try{
        const { from, to, message, replyTo, onlineUsers} = req.body
        const recipientSocket = onlineUsers.includes(to);
        let replyToId = null;
        
        if (replyTo) {
            // ✅ Check if replyTo exists in the database
            const repliedMessage = await messageModel.findById(replyTo);
            if (repliedMessage) {
                replyToId = replyTo; // ✅ Only assign if found in DB
            }
        }
        console.log("✅ The user is offline so the message is not sent in the messageController")
        const data = await messageModel.create({
            message: {text: message},
            users: [from, to],
            sender: from,
            replyTo: replyToId,
            status: recipientSocket ? "sent" : "not_sent",
            seenBy: recipientSocket ? [to] : [],
        });
        if(data) return res.json({message: message, users: {from, to}, sender: from, replyTo: replyToId, _id: data._id, recipientSocket, status: data.status});
        return res.json({message, users, sender, replyTo});
    }catch(ex){
        next(ex);
    }
}
module.exports.getMsg = async (req, res, next) => { 
    try {
        const { from, to } = req.body;

        const messages = await messageModel
            .find({ users: { $all: [from, to] } })
            .sort({ createdAt: 1 })
            .populate("replyTo", "message.text sender"); // ✅ Populate replied message

        const projectMessages = messages.map((msg) => ({
            fromSelf: msg.sender.toString() === from,
            message: msg.message.text,
            createdAt: msg.createdAt,
            id: msg._id,
            replyTo: msg.replyTo
                ? {
                      message: msg.replyTo.message.text, // ✅ Original message text
                      sender: msg.replyTo.sender, // ✅ Sender of original message
                  }
                : null,
            status: msg.status,
        }));

        res.json(projectMessages);
    } catch (ex) {
        console.error("Error in getMsg:", ex);
        next(ex);
    }
};


module.exports.clearMsg = async (req, res, next) => {
    try {
        const { from, to } = req.body;

        await messageModel.deleteMany({
            users: { $all: [from, to] },
        });

        res.json({ success: true, msg: "Chat cleared successfully" });
    } catch (ex) {
        next(ex);
    }
};

module.exports.markRead = async (req, res, next) => {
    
    try {
        const { userId, chatId } = req.body;

        await messageModel.updateMany(
            { 
                users: { $all: [userId, chatId] }, // Ensure both users are in the chat
                sender: { $ne: userId }, // Only mark received messages as read
                status: { $ne: "read" } // Only update unread messages
            },
            { 
                $set: { status: "read" }, 
                $addToSet: { seenBy: userId } 
            }
        );

        res.json({ success: true, status: "read" });
    } catch (error) {
        console.error("Error marking messages as read:", error);
        res.status(500).json({ success: false, error: "Failed to mark messages as read" });
    }
    
}