const express = require('express')
const router = express.Router()
const dataController = require('../controller/Controller')

router.post('/createUser', dataController.createUser.bind(dataController))
//router.get('/getUser', dataController.getUser)
router.post('/login', dataController.login)
router.post('/validate/:token', dataController.validateLink)
//https://localhost:3500/login
module.exports = router

