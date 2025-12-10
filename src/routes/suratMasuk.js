const express = require('express')
const router = express.Router()
const controller = require('../controller/controller_SuratMasuk')

const { upload } = require('../utils/index'); // sudah pakai Cloudinary

router.post('/create', upload.single('file'), controller.create);
// router.post('/create/excel', upload.single('file'), controller.createExcel)
router.get('/get', controller.getAll)
router.get('/get/:id', controller.getById)
router.put('/edit/:id', controller.updateOne)
router.delete('/delete/:id', controller.deleteOne)
router.delete('/delete-all', controller.deleteAll)
router.get('/count', controller.getCount)

// Disposisi
router.post('/disposisi/:id', controller.addDisposisi);
router.get('/disposisi/get/:id', controller.getByDisposisi);
router.put('/disposisi/lihat/:idSurat', controller.tandaiSudahDilihat);
router.delete('/disposisi/:idSurat/:idPegawai', controller.deleteDisposisi);



module.exports = router