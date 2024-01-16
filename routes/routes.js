const express = require('express')
const router = express.Router()
const dataController = require('../controller/Controller')

router.post('/createUser', dataController.createUser.bind(dataController))
router.post('/login', dataController.login)
router.post('/validate/:token', dataController.validateLink)

router.get('/', dataController.home)
router.get('/login', dataController.getLogin)

module.exports = router

