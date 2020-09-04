const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const db = require("./database");
const bcrypt = require("bcrypt");

const LOGIN_ROUTE = "/login";
const HOME_ROUTE = "/";

// Initialize passport
passport.use(
  new LocalStrategy((username, password, done) => {
    db.getUserIdByName(username).then((id) =>
      db
        .getUserPassword(id)
        .then((dbPass) => bcrypt.compare(password, dbPass))
        .then((correct) => {
          if (correct) db.getUserById(id).then((user) => done(null, user));
          else done(null, false);
        })
        .catch((err) => {
          throw err;
        })
    );
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  done(null, await db.getUserById(id));
});

/**
 * @callback getAllowedID
 * @param {Object} req The node request object associated with that request.
 * @returns {number} An ID to be compared against the logged in user ID.
 */

/**
 * Checks for authentciation. If the user isn't authenticated he is redirected to the LOGIN_ROUTE
 * If any of the optional parameters isn't matched, the user is return 403 "Forbidden".
 * @param {boolean} [administrative = true] If true then users with higher than or equal to ADMIN are permited.
 * @param {getAllowedID} [getAllowedID = undefined] Callback that returns the ID that should be compared against the current logged in user.
 */
exports.requiresAuthentication = (administrative = false, getAllowedID = undefined) => (req, res, next) => {
  if (req.isUnauthenticated()) return res.redirect(LOGIN_ROUTE);
  if ((administrative && req.user.roleId <= db.roles.ADMIN) || (getAllowedID && req.user.id == getAllowedID(req)))
    return next();
  return res.status(403).send("Forbidden");
};

/**
 * If the user is authenticated he is redirected to HOME_ROUTE
 */
exports.requiresNotAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return res.redirect(HOME_ROUTE);
  next();
};

exports.authenticate = passport.authenticate("local", {
  failureRedirect: "/login",
});

exports.passport = passport;
