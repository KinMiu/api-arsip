const express = require("express");
const router = express.Router();
const controller = require("../controller/controller_SuratMasuk");
const {upload} = require("../utils/index");

// =======================
// SURAT MASUK
// =======================
router.post("/create", upload.single("file"), controller.create);
router.get("/get", controller.getAll);
router.get("/get/:id", controller.getById);
router.put("/edit/:id", controller.updateOne);
router.delete("/delete/:id", controller.deleteOne);
router.delete("/delete-all", controller.deleteAll);
router.get("/count", controller.getCount);

// =======================
// DISPOSISI (PEMIMPIN)
// =======================
router.post("/disposisi/:id", controller.addDisposisi);
router.put("/disposisi/lihat/:idSurat", controller.tandaiSudahDilihat);
router.put("/disposisi/paraf/:idSurat", controller.parafSurat);
router.get("/get-with-disposisi", controller.getWithDisposisi);

module.exports = router;
