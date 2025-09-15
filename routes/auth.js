const passport = require("passport");
const userModel = require("./users");
require('dotenv').config();

var GoogleStrategy = require("passport-google-oauth2").Strategy;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/callback",
      passReqToCallback: true,
    },
    async function (request, accessToken, refreshToken, profile, done) {
      try {
        // Find user by Google ID
        let user = await userModel.findOne({ googleId: profile.id });

        if (user) {
          // User exists, return them
          return done(null, user);
        } else {
          // User doesn't exist, create them
          // Add safety checks for profile data
          const userEmail =
            profile.emails && profile.emails[0]
              ? profile.emails[0].value
              : null;
          const userPhoto =
            profile.photos && profile.photos[0]
              ? profile.photos[0].value
              : null;

          const newUser = await userModel.create({
            googleId: profile.id,
            email: userEmail,
            name: profile.displayName,
            profileImage: userPhoto, // Changed to match your schema
            username: profile.id + '@google' // Use email as username
          });
          console.log(newUser);

          return done(null, newUser);
        }
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async function(id, done) {
  try {
    const user = await userModel.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});