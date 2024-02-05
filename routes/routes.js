const express = require('express')
const router = express.Router()
const dataController = require('../controller/Controller')

router.post('/createUser', dataController.createUser.bind(dataController))
router.post('/login', dataController.login)
router.post('/validate/:token', dataController.validateLink)
router.post('/changeName', dataController.changeName)
router.post('/changePassword', dataController.changePassword)
router.post('/deleteAccount', dataController.deleteAccount)
router.post('/authenticate', dataController.authenticate)
router.post('/sendPasswordRecovery', dataController.sendPasswordRecovery)
router.post('/recoverPassword', dataController.recoverPassword)

module.exports = router

