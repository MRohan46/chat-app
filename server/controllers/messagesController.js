const messageModel = require("../model/MessageModel");
module.exports.addMsg = async (req, res, next) => {
    try{
        const { from, to, message } = req.body;
        const data = await messageModel.create({
            message: {text: message},
            users: [from, to],
            sender: from,
        });
        if(data) return res.json({msg:"message added"});
        return res.json({msg:"message added"});
    }catch(ex){
        next(ex);
    }
}
module.exports.getMsg = async (req, res, next) => {
    try{
        const {from, to} = req.body;
        const messages = await messageModel.find({
            users:{
                $all: [from, to],
            },
        }).sort({ createdAt: 1 });
        const projectMessages = messages.map((msg)=>{
            return{
                fromSelf: msg.sender.toString() === from,
                message: msg.message.text,
                createdAt: msg.createdAt
            };
        });
        res.json(projectMessages)
    }catch(ex){
        next(ex);
    }
}

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