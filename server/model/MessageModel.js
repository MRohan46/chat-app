const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        message: {
            text: {
                type: String,
                required: true,
            },
        },
        users: {
            type: [mongoose.Schema.Types.ObjectId], // Array of User IDs
            ref: "User",
            required: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        replyTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
            default: null, // If it's a reply, store the original message ID
        },
        status: {
            type: String,
            enum: ["sent", "not_sent", "read"],
            default: "not_sent", // Default to "not_sent" when the message is first created
        },
        seenBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Message", messageSchema);
