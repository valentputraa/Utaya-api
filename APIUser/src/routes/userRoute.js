import express from "express";
import { deleteUsers, getUserLogin, loginUsers, logoutUsers, storeUsers, updatePassword } from "../controller/userController.js";
import { verifToken } from "../middleware/login.js";

const router = express.Router();
router.get('/users', verifToken, getUserLogin);
router.post('/users', storeUsers);
router.post('/login', loginUsers);
router.put('/users', verifToken, updatePassword);
router.delete('/logout', verifToken, logoutUsers);
router.delete('/users', verifToken, deleteUsers);

export default router;