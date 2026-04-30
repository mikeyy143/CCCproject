const express = require("express");
const { solveScheduling } = require("../controllers/solveController");

const router = express.Router();

router.post("/solve", solveScheduling);

module.exports = router;
