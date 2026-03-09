import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import pool from "../config/db.js";

// ── POST /auth/login ──────────────────────────────────────────────────────────
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email.toLowerCase().trim()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
    );

    res.json({
      token,
      user: {
        id:    user.id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ── POST /auth/register ───────────────────────────────────────────────────────
export async function register(req, res, next) {
  try {
    const { name, email, password, role = "dentist" } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    const validRoles = ["dentist", "staff", "admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: `Role must be one of: ${validRoles.join(", ")}` });
    }

    // Check duplicate email
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email.toLowerCase().trim()]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();

    await pool.query(
      "INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)",
      [id, name.trim(), email.toLowerCase().trim(), hashedPassword, role]
    );

    const token = jwt.sign(
      { id, email: email.toLowerCase(), role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
    );

    res.status(201).json({
      token,
      user: { id, name: name.trim(), email: email.toLowerCase().trim(), role },
    });
  } catch (err) {
    next(err);
  }
}

// ── GET /auth/me ──────────────────────────────────────────────────────────────
export async function me(req, res) {
  res.json({ user: req.user });
}
