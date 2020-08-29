const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// Initialize passport
/* passport.use(new localStrategy(
    function (username, password, done) {
        console.log('36');
        db.query("SELECT * FROM users WHERE username=$1", [username], (err, results) => {
            if (err) return done(err);

            console.log(results);
            if (results.rows[0] && results.rows[0].password == password)
                done(null, results.rows[0]);
            done(null, false);

        });
    }));*/
passport.use(new LocalStrategy(
    function (username, password, done) {
        console.log("LocalStrategy working...");
        return done(null, { id: 1, username: 'Joe', password: 'schmo' });
    }
));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    console.log('31');
    db.query("SELECT * FROM users WHERE id=$1", [id], function (err, user) {
        if (err) { return done(err); }
        done(null, results.rows[0]);
    });
});


module.exports = passport;