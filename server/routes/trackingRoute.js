const { tracking } = require("../controllers/trackingController");

const router = require("express").Router();
router.post("/", tracking);

module.exports = router;