var express = require("express");
var router = express.Router();
const { authenticate, requiresAuthentication } = require("../passport");

/* GET home page. */
router.get("/", requiresAuthentication(), (req, res) => {
  res.render("index", { title: "Home", name: req.user.fullname });
});

router.post("/login", authenticate, (req, res) => {
  res.redirect("/");
});

router.get("/login", (req, res) => {
  res.render("login");
});

module.exports = router;
