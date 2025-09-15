const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/samanyayDB");

// Remove passport-local-mongoose if you're only using Google OAuth
// const plm = require("passport-local-mongoose");

const userSchema = mongoose.Schema({
  username: {
    type: String,
    sparse: true
  },
  name: String,
  password: String,
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  email: {
    type: String,
    sparse: true
  },
  profileImage: String,
  isPro: Boolean,
  contact: Number,
  cases: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "case",
  }]
});

// Only use passport-local-mongoose if you need local authentication
// userSchema.plugin(plm, {
//   usernameUnique: false,
//   errorMessages: {
//     UserExistsError: 'This email is already registered'
//   }
// });

module.exports = mongoose.model("user", userSchema);