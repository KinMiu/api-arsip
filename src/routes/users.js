const express = require('express')
const router = express.Router()
const controller = require('../controller/controller_users')
const { verifyToken } = require('../middleware/verifyToken')
const auth = require('../controller/controller_auth')

router.post('/login', auth.login)
router.post('/refreshToken', auth.refreshToken)
router.post('/logout', auth.logout)

router.post('/create', controller.create)
router.get('/get', verifyToken, controller.getAll)
router.get('/get/:id', controller.getById)
router.put('/edit/:id', controller.updateOne)
router.delete('/delete/:id', controller.deleteOne)
router.get('/count', controller.getCount)

router.put('/change-name/:id', controller.changeName);
router.put('/change-password/:id', controller.changePassword);

module.exports = router