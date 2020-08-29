var express = require('express');
var router = express.Router();
const passport = require('../passport');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send({message: "Hello world!"});
});

router.post('/login', passport.authenticate('local', { failureRedirect: '/login'}),
  (req, res) => {
    res.redirect('/');
  }
)

router.get('/login', (req, res) => {
  res.status(200).send("FAIL!");
})

module.exports = router;
