const express = require('express');
const router = express.Router();
const controller = require('../controller/controller_SuratKeluar');
const { upload } = require('../utils/index'); // pakai Cloudinary

// CREATE surat keluar
router.post('/create', upload.single('file'), controller.create);

// CRUD dasar
router.get('/get', controller.getAll);
router.get('/get/:id', controller.getById);
router.put('/edit/:id', controller.updateOne);
router.delete('/delete/:id', controller.deleteOne);
router.delete('/delete-all', controller.deleteAll);

// Jumlah data
router.get('/count', controller.getCount);

module.exports = router;
