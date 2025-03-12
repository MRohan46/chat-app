const messageModel = require("../model/MessageModel");
const mongoose = require("mongoose");

module.exports.addMsg = async (req, res, next) => {
    try{
        const { from, to, message, replyTo } = req.body
        let replyToId = null;
        if (replyTo) {
            // ✅ Check if replyTo exists in the database
            const repliedMessage = await messageModel.findById(replyTo);
            if (repliedMessage) {
                replyToId = replyTo; // ✅ Only assign if found in DB
            }
        }
        const data = await messageModel.create({
            message: {text: message},
            users: [from, to],
            sender: from,
            replyTo: replyToId,
        });
        if(data) return res.json({message: message, users: {from, to}, sender: from, replyTo: replyToId, _id: data._id,});
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