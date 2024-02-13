const express = require("express");
const { onConnect } = require("../controllers/health.controllers");

const router = express.Router();

router.route("/").get(onConnect);

module.exports = router;
