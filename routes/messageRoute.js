const express = require('express');
const router = express.Router();
const MessageController = require('../controllers/messageController');
const utilities = require("../utilities/");
const regValidate = require('../utilities/account-validation');
const userCheck = require('../middleware/userCheck');

// Routes for messages
router.get('/inbox', userCheck.isAuthenticated, utilities.handleErrors(MessageController.inbox));
router.get('/archive-message', userCheck.isAuthenticated, utilities.handleErrors(MessageController.getArchiveMessage));
router.get('/new', userCheck.isAuthenticated, utilities.handleErrors(MessageController.newMessage));
router.post('/new', userCheck.isAuthenticated, regValidate.messageFormRules(), regValidate.checkFormData, utilities.handleErrors(MessageController.createMessage));
router.get('/read/:id', userCheck.isAuthenticated, utilities.handleErrors(MessageController.markAsRead));
router.get('/archive/:id', userCheck.isAuthenticated, utilities.handleErrors(MessageController.archiveMessage));
router.get('/delete/:id', userCheck.isAuthenticated, utilities.handleErrors(MessageController.deleteMessage));
router.get('/open/:message_id', userCheck.isAuthenticated, utilities.handleErrors(MessageController.readMessage));
router.get('/reply/:message_id', userCheck.isAuthenticated, utilities.handleErrors(MessageController.replyToMessage));
router.post('/reply/:message_id', userCheck.isAuthenticated, regValidate.messageFormRules(), regValidate.checkReplyFormData, utilities.handleErrors(MessageController.sendReplyMessage));

module.exports = router;
