import express from "express";

const router = express.Router();

// middlewares
import { isAdmin, requireSignin } from "../middlewares";

//controllers
import {
    register,
    login,
    currentUser,
    forgotPassword,
    profileUpdate,
    findPeople,
    addFollower,
    userFollow,
    userFollowing,
    removeFollower,
    userUnfollow,
    searchUser,
    getUser,
} from "../controllers/auth";

router.post("/register", register);
router.post("/login", login);
router.get("/current-user", requireSignin, currentUser);
router.get("/forgot-password", forgotPassword);

//update form
router.put("/profile-update", requireSignin, profileUpdate);
//followers
router.get("/find-people", requireSignin, findPeople);
// following
router.put("/user-follow", requireSignin, addFollower, userFollow);
// following list
router.get("/user-following", requireSignin, userFollowing);
// unfollowing
router.put("/user-unfollow", requireSignin, removeFollower, userUnfollow);

// search
router.get("/search-user/:query", searchUser);

router.get("/user/:username", getUser);

// admin
router.get("/current-admin", requireSignin, isAdmin, currentUser);

module.exports = router;
