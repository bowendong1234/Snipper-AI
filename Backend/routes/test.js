const express = require("express");
const router = express.Router();

router.post("/work", (req, res) => {
    res.json({ message: "work" });
});

module.exports = router;