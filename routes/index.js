var express = require("express");
const passport = require("passport");
require("./auth");
var router = express.Router();
const userModel = require("./users");
const caseModel = require("./case");

// Removed duplicate function - using isloggedin below

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/",
    successRedirect: "/profile",
  }),
  (req, res) => {}
);

function isloggedin(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  // For API routes, send JSON error instead of redirect
  if (req.path.startsWith("/api/")) {
    return res.status(401).json({ error: "Authentication required" });
  }
  res.redirect("http://localhost:5173/"); // For regular routes
}

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

router.get("/api/profile", isloggedin, async (req, res) => {
  try {
    console.log("=== DEBUG SESSION INFO ===");
    console.log("Session ID:", req.sessionID);
    console.log("Session:", req.session);
    console.log("Is Authenticated:", req.isAuthenticated());
    console.log("User ID from session:", req.session.passport?.user);
    console.log("========================");

    // Use _id instead of username since session stores the ObjectId
    const user = await userModel.findById(req.session.passport.user);

    console.log("Found user:", user);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/api/NewCase", isloggedin, async (req, res) => {
  try {
    // 1. Create the new case
    const newCase = await caseModel.create({
      title: req.body.title,
      description: req.body.description,
      user: req.user._id,
    });

    // 2. Find the user and add the case to their cases array
    const user = await userModel.findById(req.user._id);
    user.cases.push(newCase._id);
    await user.save();

    // 3. Send JSON response instead of redirect
    res.status(201).json({ 
      success: true,
      message: "Case created successfully", 
      case: newCase
    });
    
  } catch (error) {
    console.error("Case creation error:", error);
    res.status(500).json({ 
      success: false,
      error: "Case creation failed: " + error.message 
    });
  }
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
