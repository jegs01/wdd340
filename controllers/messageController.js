const MessageModel = require('../models/message-model');
const accountModel = require("../models/account-model")
const utilities = require("../utilities/");
const jwt = require('jsonwebtoken');

// Display inbox messages
async function inbox(req, res, next) {
    try {
        let nav = await utilities.getNav();

        const token = req.cookies.jwt;

        if (!token) {
            req.flash('notice', 'You must be logged in to access the dashboard.');
            return res.redirect('/account/login');
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const userId = decoded.account_id;

        const messages = await MessageModel.getInboxMessages(userId);

        const noMessages = messages.length === 0;

        const messagesWithSenderNames = await Promise.all(
            messages.map(async (message) => {
                const sender = await accountModel.getAccountById(message.message_from);

                return {
                    ...message,
                    sender_firstname: sender ? sender.account_firstname : 'Unknown',
                    sender_lastname: sender ? sender.account_lastname : 'Unknown',
                };
            })
        );

        const account = await accountModel.getAccountById(userId);
        const account_firstname = account.account_firstname;
        const account_lastname = account.account_lastname;
        const archivedMessageCount = await MessageModel.countArchivedMessages(userId);

        res.render('message/inbox', {
            title: `${account_firstname} ${account_lastname} Inbox`,
            nav,
            messages: messagesWithSenderNames,
            noMessages,
            archivedMessageCount
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
}

// Create a new message
async function createMessage(req, res, next) {
    try {
        let nav = await utilities.getNav();
        const users = await accountModel.getAllUsers();
        const { subject, messageBody, messageTo } = req.body;
        const token = req.cookies.jwt;

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const messageFrom = decoded.account_id;

        if (!subject || !messageBody || !messageTo) {
            req.flash('notice', 'All fields are required.');
            return res.render('message/new-message', {
                title: "Create a New Message",
                nav,
                errors: null,
                users,
                subject,
                messageBody,
                messageTo
            });
        }

        await MessageModel.createMessage(subject, messageBody, messageTo, messageFrom);

        res.redirect('/message/inbox');
    } catch (error) {
        console.error("Error creating message:", error);
        req.flash('notice', 'Server error. Unable to send message.');
        res.status(500).redirect('/message/new');
    }
}

// Mark message as read
async function markAsRead(req, res, next) {
    try {
        const { id } = req.params;
        await MessageModel.markMessageAsRead(id);
        res.redirect('/message/inbox');
    } catch (error) {
        res.status(500).send('Server Error');
    }
}

// Archive a message
async function archiveMessage(req, res, next) {
    try {
        const { id } = req.params;
        await MessageModel.archiveMessage(id);
        res.redirect('/message/inbox');
    } catch (error) {
        res.status(500).send('Server Error');
    }
}

// Delete a message
async function deleteMessage(req, res, next) {
    try {
        const { id } = req.params;
        await MessageModel.deleteMessage(id);
        res.redirect('/message/inbox');
    } catch (error) {
        res.status(500).send('Server Error');
    }
}
 
async function newMessage(req, res, next) {
    try {
        const nav = await utilities.getNav();
        const users = await accountModel.getAllUsers();
        const { subject, messageBody, messageTo } = req.body;

        res.render('message/new-message', {
            title: 'Create a New Message',
            nav,
            users,
            errors: null,
            subject,
            messageBody,
            messageTo
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
}


async function readMessage(req, res, next) {
    try {
        const { message_id } = req.params;
       
        const message = await MessageModel.findById(message_id);

        if (!message) {
            return res.status(404).send('Message not found');
        }

        const nav = await utilities.getNav();

        const sender = await accountModel.getAccountById(message.message_from);

        const messageWithSender = {
            ...message,
            sender_firstname: sender ? sender.account_firstname : 'Unknown',
            sender_lastname: sender ? sender.account_lastname : 'Unknown',
        };

        res.render('message/viewMessage', {
            title: `${message.message_subject}`,
            nav,
            message: messageWithSender,
        });
    } catch (error) {
        console.error('Error reading message:', error);
        res.status(500).send('Server Error');
    }
}

async function replyToMessage(req, res, next) {
    try {
        const { message_id } = req.params;
        const { subject, messageBody, messageTo } = req.body;
        const message = await MessageModel.findById(message_id);
        if (!message) {
            return res.status(404).send('Message not found');
        }

        const nav = await utilities.getNav();

        const sender = await accountModel.getAccountById(message.message_from);

        const messageWithSender = {
            ...message,
            sender_id: sender ? sender.account_id : 'Unknown',
            sender_firstname: sender ? sender.account_firstname : 'Unknown',
            sender_lastname: sender ? sender.account_lastname : 'Unknown',
        };


        res.render('message/replyForm', { 
            title: 'Reply',
            message: messageWithSender,
            nav,
            errors: null,
            message_id,
            subject: message.message_subject,
            messageBody,
            messageTo
         });
    } catch (error) {
        console.error('Error loading reply form:', error);
        res.status(500).send('Server Error');
    }
}

async function sendReplyMessage(req, res, next) {
    try {
        let nav = await utilities.getNav();
        const { subject, messageBody, messageTo } = req.body;
        const { message_id } = req.params;
        const message = await MessageModel.findById(message_id);
        if (!message) {
            return res.status(404).send('Message not found');
        }

        const sender = await accountModel.getAccountById(message.message_from);
        const token = req.cookies.jwt;

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const messageFrom = decoded.account_id;

        const messageWithSender = {
            ...message,
            sender_id: sender ? sender.account_id : 'Unknown',
            sender_firstname: sender ? sender.account_firstname : 'Unknown',
            sender_lastname: sender ? sender.account_lastname : 'Unknown',
        };

        if (!subject || !messageBody || !messageTo) {
            req.flash('notice', 'All fields are required.');
            return res.render('message/replyForm', {
                title: "Reply",
                nav,
                errors: null,
                message: messageWithSender,
                message_id,
                subject,
                messageBody,
                messageTo
            });
        }

        await MessageModel.createMessage(subject, messageBody, messageTo, messageFrom);

        res.redirect('/message/inbox');
    } catch (error) {
        console.error("Error creating message:", error);
        req.flash('notice', 'Server error. Unable to send message.');
        res.status(500).redirect('/message/new');
    }
}

// Display archived messages
async function getArchiveMessage(req, res, next) {
    try {
        let nav = await utilities.getNav();

        const token = req.cookies.jwt;

        if (!token) {
            req.flash('notice', 'You must be logged in to access the dashboard.');
            return res.redirect('/account/login');
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const userId = decoded.account_id;

        const messages = await MessageModel.getArchivedMessages(userId);

        const noMessages = messages.length === 0;

        const messagesWithSenderNames = await Promise.all(
            messages.map(async (message) => {
                const sender = await accountModel.getAccountById(message.message_from);

                return {
                    ...message,
                    sender_firstname: sender ? sender.account_firstname : 'Unknown',
                    sender_lastname: sender ? sender.account_lastname : 'Unknown',
                };
            })
        );

        const account = await accountModel.getAccountById(userId);
        const account_firstname = account.account_firstname;
        const account_lastname = account.account_lastname;

        res.render('message/archives', {
            title: `${account_firstname} ${account_lastname} Archives`,
            nav,
            messages: messagesWithSenderNames,
            noMessages,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
}

module.exports = {
    inbox: utilities.handleErrors(inbox),
    createMessage: utilities.handleErrors(createMessage),
    markAsRead: utilities.handleErrors(markAsRead),
    archiveMessage: utilities.handleErrors(archiveMessage),
    deleteMessage: utilities.handleErrors(deleteMessage),
    newMessage: utilities.handleErrors(newMessage),
    readMessage: utilities.handleErrors(readMessage),
    replyToMessage: utilities.handleErrors(replyToMessage),
    sendReplyMessage: utilities.handleErrors(sendReplyMessage),
    getArchiveMessage: utilities.handleErrors(getArchiveMessage),
};
