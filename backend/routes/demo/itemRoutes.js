import express from "express";
import createContextLogger from "../../logger/contextLogger.js";
import {
    createItemController,
    deleteItemController,
    getAllItemsController,
    getItemByIdController,
    updateItemController,
} from "../../controllers/demo/itemController.js";

const router = express.Router();
const logger = createContextLogger("itemRoutes");

router.use((req, res, next) => {
    logger.debug("Demo item route accessed", { method: req.method, path: req.path });
    next();
});

router.post("/new", createItemController);
router.get("/all", getAllItemsController);
router.get("/:itemId", getItemByIdController);
router.patch("/:itemId", updateItemController);
router.delete("/:itemId", deleteItemController);

export default router;
