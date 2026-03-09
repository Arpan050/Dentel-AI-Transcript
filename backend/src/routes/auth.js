import { Router } from "express";
import { login, register, me } from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// POST /auth/login
router.post("/login", login);

// POST /auth/register
router.post("/register", register);

// GET /auth/me  (protected)
router.get("/me", authenticate, me);

export default router;
