// src/routes/orderRoutes.js
const router = require("express").Router();
const {
  createOrder,
  getOrders,
  updateStatus,
  updateOrder,
  trackOrder,
} = require("../controllers/orderController");
const { requireAdmin } = require("../middleware/adminAuth");

router.post("/", createOrder); // public (customers)
router.get("/", requireAdmin, getOrders);
router.get("/track/:phone", trackOrder); // public (customers)
router.patch("/:id/status", requireAdmin, updateStatus);
router.patch("/:id", requireAdmin, updateOrder);

module.exports = router;