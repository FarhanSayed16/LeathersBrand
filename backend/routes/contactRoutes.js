import express from "express";
import { createContact, listContacts } from "../controllers/contactController.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

router.post("/", createContact);
router.get("/", adminAuth, listContacts);

export default router;
