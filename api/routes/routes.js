const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const passport = require('passport');
const path = require("path");
const { catchErrors } = require('../handlers/errorHandlers');

router.get("/", postController.indexPage);

router.get("/login", userController.loginForm);
router.post("/login", authController.login)

router.get("/timeline", authController.isLoggedIn, postController.timeline);

router.get("/published", authController.isLoggedIn, postController.drafts);

router.post("/api/register",
  userController.validateRegister,
  userController.register,
  function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
      if (err) { return next(err); }
      if (!user) { return res.redirect('/login'); }
      req.logIn(user, function(err) {
        if (err) { return next(err); }
        res.send( { success: { type: 'success', message: "Successfully registered. Welcome!" } } );
      });
    })(req, res);
  },
);

router.get("/logout", authController.logout);

module.exports = router;