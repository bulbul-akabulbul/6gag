const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const db = require("./database");
const bcrypt = require("bcrypt");

const LOGIN_ROUTE = "/login";
const HOME_ROUTE = "/";

// Initialize passport
passport.use(
  new LocalStrategy(async (username, password, done) => {
    const userId = await db.getUserIdByName(username);
    if (userId.length === 0) done(null, false);
    const userPw = (await db.getUserPassword(userId[0].id))[0].password;
    const user = await db.getUserById(userId[0].id);
    console.log(user);

    if (bcrypt.compareSync(password, userPw)) return done(null, user);
    done(null, false);
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  done(null, await db.getUserById(id));
});

/*
If administrative = true only administrative users are allowed
If ownUserOnly = true the authenticated user is compared to req.params.id
*/
exports.requiresAuthentication = (administrative = false, ownUserOnly = false) => (req, res, next) => {
  if (req.isUnauthenticated()) return res.redirect(LOGIN_ROUTE);
  if ((administrative && req.user.roleId <= db.roles.ADMIN) || (ownUserOnly && req.user.id == ownUserOnly(req)))
    return next();
  return res.status(403).send("Forbidden");
};

exports.requiresNotAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return res.redirect(HOME_ROUTE);
  next();
};

exports.authenticate = passport.authenticate("local", {
  failureRedirect: "/login",
});

exports.passport = passport;
