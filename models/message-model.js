const pool = require("../database/")

/* **********************
 *   Create a new message in the database
 * ********************* */
async function createMessage(subject, messageBody, messageTo, messageFrom) {
    try {
        const sql = `
            INSERT INTO message (message_subject, message_body, message_to, message_from, message_created, message_read, message_archived)
            VALUES ($1, $2, $3, $4, NOW(), FALSE, FALSE) RETURNING *;
        `;
        const values = [subject, messageBody, messageTo, messageFrom];
        const result = await pool.query(sql, values);
        return result.rows[0];
    } catch (error) {
        console.error("Error creating message:", error);
        throw new Error("Unable to create message");
    }
}

/* **********************
 *   Get messages for a specific user (inbox)
 * ********************* */
async function getInboxMessages(userId) {
    try {
        const sql = `
            SELECT * FROM message 
            WHERE message_to = $1 AND message_archived = FALSE 
            ORDER BY message_created DESC;
        `;
        const result = await pool.query(sql, [userId]);
        return result.rows;
    } catch (error) {
        console.error("Error retrieving inbox messages:", error);
        throw new Error("Unable to retrieve inbox messages");
    }
}

/* **********************
 *   Get archived messages for a specific user
 * ********************* */
async function getArchivedMessages(userId) {
    try {
        const sql = `
            SELECT * FROM message 
            WHERE message_to = $1 AND message_archived = TRUE 
            ORDER BY message_created DESC;
        `;
        const result = await pool.query(sql, [userId]);
        return result.rows;
    } catch (error) {
        console.error("Error retrieving archived messages:", error);
        throw new Error("Unable to retrieve archived messages");
    }
}

/* **********************
 *   Mark a message as read
 * ********************* */
async function markMessageAsRead(messageId) {
    try {
        const sql = `
            UPDATE message 
            SET message_read = TRUE 
            WHERE message_id = $1 
            RETURNING *;
        `;
        const result = await pool.query(sql, [messageId]);
        return result.rows[0];
    } catch (error) {
        console.error("Error marking message as read:", error);
        throw new Error("Unable to mark message as read");
    }
}

/* **********************
 *   Archive a message
 * ********************* */
async function archiveMessage(messageId) {
    try {
        const sql = `
            UPDATE message 
            SET message_archived = TRUE 
            WHERE message_id = $1 
            RETURNING *;
        `;
        const result = await pool.query(sql, [messageId]);
        return result.rows[0];
    } catch (error) {
        console.error("Error archiving message:", error);
        throw new Error("Unable to archive message");
    }
}

/* **********************
 *   Delete a message
 * ********************* */
async function deleteMessage(messageId) {
    try {
        const sql = `
            DELETE FROM message 
            WHERE message_id = $1 
            RETURNING *;
        `;
        const result = await pool.query(sql, [messageId]);
        return result.rows[0];
    } catch (error) {
        console.error("Error deleting message:", error);
        throw new Error("Unable to delete message");
    }
}

/* **********************
 *   Find a message by ID
 * ********************* */
async function findById(messageId) {
    try {
        const sql = `
            SELECT * FROM message
            WHERE message_id = $1;
        `;
        const result = await pool.query(sql, [messageId]);
        return result.rows[0];
    } catch (error) {
        console.error("Error fetching message by ID:", error);
        throw new Error("Unable to fetch message");
    }
}

async function countArchivedMessages(userId) {
    try {
        const sql = `
            SELECT COUNT(*) AS total_archived 
            FROM message 
            WHERE message_to = $1 AND message_archived = TRUE;
        `;
        const result = await pool.query(sql, [userId]);
        return parseInt(result.rows[0].total_archived, 10);
    } catch (error) {
        console.error("Error retrieving archived message count:", error);
        throw new Error("Unable to retrieve archived message count");
    }
}

async function countUnreadMessages(userId) {
    try {
        const sql = `
            SELECT COUNT(*) AS total_unread 
            FROM message 
            WHERE message_to = $1 AND message_archived = FALSE AND message_read = FALSE;
        `;
        const result = await pool.query(sql, [userId]);
        return parseInt(result.rows[0].total_unread, 10);
    } catch (error) {
        console.error("Error retrieving unread message count:", error);
        throw new Error("Unable to retrieve unread message count");
    }
}

module.exports = {
    createMessage,
    getInboxMessages,
    getArchivedMessages,
    markMessageAsRead,
    archiveMessage,
    deleteMessage,
    findById,
    countArchivedMessages,
    countUnreadMessages
};
