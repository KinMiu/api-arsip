const express = require("express");
const router = express.Router();
const controller = require("../controller/controller_SuratKeluar");
const {upload} = require("../utils/index"); // pakai Cloudinary

router.post("/create", upload.single("file"), controller.create);

router.post("/preview", controller.preview);
router.post("/generate", controller.generate);

router.get("/get-draft", controller.getWithDraft);
router.put("/acc/:id", upload.single("file"), controller.acc);

router.post("/revisi/:id", upload.single("file"), controller.addRevisi);
router.put(
  "/revisi/upload/:id/:index",
  upload.single("file"),
  controller.uploadPerbaikan
);

router.get("/get", controller.getAll);
router.get("/get/:id", controller.getById);
router.put("/edit/:id", controller.updateOne);
router.delete("/delete/:id", controller.deleteOne);

module.exports = router;
