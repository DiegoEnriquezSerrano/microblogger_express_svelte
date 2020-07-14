const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const settingsController = require("../controllers/settingsController");
const passport = require('passport');
const path = require("path");
const { catchErrors } = require('../handlers/errorHandlers');

router.get("/", authController.isLoggedIn, postController.indexPage);

router.get("/login", userController.loginForm);

router.get("/timeline", authController.isLoggedIn, postController.timeline);
router.get("/drafts", authController.isLoggedIn, postController.drafts);
router.get("/published", authController.isLoggedIn, postController.published);
router.get("/liked", authController.isLoggedIn, postController.liked);


router.get("/directory", authController.isLoggedIn, userController.directory);
router.get("/getUsers", authController.isLoggedIn, userController.directoryUsers);

router.get("/settings", authController.isLoggedIn, settingsController.profile);
router.get("/account", authController.isLoggedIn, settingsController.account);

router.get("/authorization", authController.isLoggedIn, authController.sendUser);

router.post("/settings",
  authController.isLoggedIn,
  settingsController.upload,
  catchErrors(settingsController.resize),
  catchErrors(settingsController.updateProfile)
)

router.post('/login',
  passport.authenticate('local'),
  function(req, res) {
    res.send({
      response: { type: 'success', name: 'UserLogin', message: 'Successfully authenticated. Welcome back!' }
    });
  },
);

router.post("/register",
  userController.validateRegister,
  userController.register,
  function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
      if (err) { return next(err); }
      if (!user) { return res.redirect('/login'); }
      req.logIn(user, function(err) {
        if (err) { return next(err); }
        res.send({
          response: { type: 'success', name: 'UserRegister', message: "Successfully registered. Welcome!" }
        });
      });
    })(req, res);
  },
);

router.get("/logout", authController.logout);

module.exports = router;