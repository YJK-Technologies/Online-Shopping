// routes/dataRoutes.js
const express = require("express");
const dataController = require("../controllers/dataController");
const router = express.Router();
const path = require("path");
const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage(),

  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload2 = multer({ storage });

router.post("/VerifyCustomer", dataController.VerifyCustomer);
router.post('/verifyOtp', dataController.verifyOtp);
router.post("/signup", dataController.signUp);
router.post("/variant", dataController.getvariant)
router.post("/ItemBrandData", dataController.getAllItemBrandData)
router.post("/addCustomerDetData", dataController.addCustomerDetData)
router.post("/uploadImage", upload2.single("image"), dataController.uploadImages);
router.post("/getItemVariant", dataController.getItemVariant)
router.post("/getPay", dataController.getPay)
router.post("/addSalesOrderHdr", dataController.addSalesOrderHdr)
router.post("/addSalesOrderDetail", dataController.addSalesOrderDetail)
router.post("/getCategoriesMaster", dataController.getCategoriesMaster)
router.post("/Recenty_ViewedInsert", dataController.Recenty_ViewedInsert)
router.post("/getCategories", dataController.getCategories)
router.post("/getSalesOrder", dataController.getSalesOrder)
router.post("/Recenty_ViewedDelete", dataController.Recenty_ViewedDelete)


module.exports = router;