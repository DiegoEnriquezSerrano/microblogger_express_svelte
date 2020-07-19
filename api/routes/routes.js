const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const settingsController = require("../controllers/settingsController");
const url = require('url');
const passport = require('passport');
const path = require("path");
const { catchErrors } = require('../handlers/errorHandlers');


router.get("/timeline", authController.isLoggedIn, postController.timeline);
router.post("/timeline", authController.isLoggedIn, postController.createPost);
router.get("/timelinePosts", postController.timelinePosts);

router.get("/published", authController.isLoggedIn, postController.published);
router.get("/publishedPosts", authController.isLoggedIn, postController.publishedPosts);

router.get("/drafts", authController.isLoggedIn, postController.drafts);
router.get("/liked", postController.liked);

router.get("/directory", authController.isLoggedIn, userController.directory);
router.get("/getUsers", authController.isLoggedIn, userController.directoryUsers);
router.get("/findUser", userController.queryUser);

router.get("/authorization", authController.isLoggedIn, authController.sendUser);

router.get("/settings", authController.isLoggedIn, settingsController.profile);
router.post("/settings",
  authController.isLoggedIn,
  settingsController.upload,
  catchErrors(settingsController.resize),
  catchErrors(settingsController.updateProfile)
)

router.get("/account", authController.isLoggedIn, settingsController.account);

router.get("/login", userController.loginForm);
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

router.get("/*", userController.find);

router.get("/", authController.isLoggedIn, postController.indexPage);

module.exports = router;