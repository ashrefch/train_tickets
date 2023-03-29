const User = require("../models/userModel")
const jwt = require("jsonwebtoken")
const dotenv = require("dotenv").config()
const asyncHandler = require("express-async-handler")
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    const user = await User.findById(payload.id);
    if (!user) {
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    done(error, false);
  }
}));

const authMiddleware = asyncHandler(async(req,res,next)=>{
    passport.authenticate('jwt', { session: false }, async (err, user, info) => {
      try {
        if (err) {
          throw err;
        }

        if (!user) {
          throw new Error(info.message);
        }

        req.user = user;
        next();
      } catch (error) {
        res.status(401).json({
          message: error.message || 'Authentication failed'
        });
      }
    })(req, res, next);
});

module.exports = {authMiddleware}