import express from "express";
import itemRoutes from "./demo/itemRoutes.js";

const router = express.Router();

router.use("/item", itemRoutes);

export default router;
