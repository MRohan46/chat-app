const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        message:{
            text: {
                type: String,
                required: true,
            },
        },
        users: Array,
        sender : {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,

        },
        replyTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Messages",
            default: null, // If it's a reply, it will store the original message ID
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Messages", messageSchema);