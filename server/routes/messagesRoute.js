const { addMsg, getMsg, clearMsg } = require("../controllers/messagesController");

const router = require("express").Router();
router.post("/addmsg/", addMsg);
router.post("/getmsg/", getMsg);
router.post("/clearMsg", clearMsg)

module.exports = router;