const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const settingsController = require("../controllers/settingsController");
const { catchErrors } = require('../handlers/errorHandlers');


router.get("/timeline", authController.isLoggedIn, postController.timeline);
router.post("/timeline", authController.isLoggedIn, postController.createPost);
router.get("/timelinePosts",
  postController.getTimelinePosts,
  postController.timelineRelays,
  postController.timelineRelayUsers
);

router.post("/relay", authController.isLoggedIn, postController.relay);

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
router.post("/login", catchErrors(authController.login));

router.post("/register", authController.register);

router.get("/logout", authController.logout);

router.get("/*", userController.find);

router.get("/", authController.isLoggedIn, postController.indexPage);

module.exports = router;