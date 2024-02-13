const express = require("express");
const { onConnect } = require("../controllers/healthControllers");

const router = express.Router();

router.route("/").get(onConnect);

module.exports = router;
