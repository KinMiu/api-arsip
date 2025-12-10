const express = require('express')
const router = express.Router()
const controller = require('../controller/controller_Jabatan')

// const { upload } = require('../utils/index')

router.post('/create', controller.create)
router.get('/get', controller.getAll)
router.get('/get/:id', controller.getById)
router.put('/edit/:id', controller.updateOne)
router.delete('/delete/:id', controller.deleteOne)
router.delete('/delete-all', controller.deleteAll)
router.get('/count', controller.getCount)



module.exports = router