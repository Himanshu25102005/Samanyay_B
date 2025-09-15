var express = require("express");
const passport = require("passport");
require("./auth");
var router = express.Router();
const userModel = require("./users");

// Removed duplicate function - using isloggedin below

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/",
    successRedirect: "/profile",
  }),
  (req, res) => {}
);

const isloggedin = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("http://localhost:5173/");
  }
};

/* GET home page. */
router.get("/", function (req, res, next) {
  res.send('<a href="/auth/google">Authenticate with Google</a>');
});

router.post("/", async (req, res) => {
  try {
    // Since passport-local-mongoose is not being used, create user directly
    const data = await userModel.create({
      email: req.body.email,
      username: req.body.username,
      password: req.body.password, // Note: This should be hashed in production
    });
    
    // For now, just redirect to login page
    res.redirect("/");
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).send("Registration failed");
  }
});

router.get("/profile", isloggedin, async (req, res) => {
  res.redirect("http://localhost:5173/profile");
});

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "http://localhost:5173/profile",
    failureRedirect: "/auth/failure",
  })
);

router.get("/auth/failure", (req, res) => {
  res.send("Something went wrong!");
});

module.exports = router;
