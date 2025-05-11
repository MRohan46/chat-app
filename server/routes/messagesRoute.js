const { addMsg, getMsg, clearMsg, markRead } = require("../controllers/messagesController");

const router = require("express").Router();
router.post("/addmsg/", addMsg);
router.post("/getmsg/", getMsg);
router.post("/clearMsg", clearMsg);
router.post("/markRead", markRead);

module.exports = router;