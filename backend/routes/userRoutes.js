const express = require('express');
const { registerUser,deleteUserById,getMe,getAllUsers,  loginUser , forgetPassword, resetPassword, fetchUserById, updateUserById, updatePassword, logoutUser, refreshToken, getUserByAdmin } = require('../controllers/userController');
const { adminProtect } = require('../middleware/adminProtect');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.post("/register", registerUser);
router.post('/login', loginUser);
router.get('/logout',logoutUser );
router.post('/refresh', refreshToken);
router.get('/all',adminProtect ,getAllUsers); // 
router.delete('/:userId',adminProtect,  deleteUserById); 
router.post('/forgot-password', forgetPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/user/:userId', fetchUserById)
router.put('/update-user/:userId', updateUserById);
router.put('/update-password/:userId', updatePassword);
router.get('/me', protect, getMe); // ✅ NEW
router.get("/admin/:userId", adminProtect, getUserByAdmin);

module.exports = router;