const { simpleParser } = require('mailparser');
const nodemailer = require('nodemailer');
const Imap = require("imap")
// const simpleParser = require('mailparser').simpleParser;


// Create a transporter using SMTP transport



// Function to send email
const sendMail = async (req, res) => {
    console.log(req.user.email)
    const transporter = nodemailer.createTransport({
        host: 'localhost',
        port: 25,
        secure: false, // true for 465, false for other ports
        auth: {
            user: req.user.email,
            pass: req.user.password
        }
    });
    try {
        // Construct email message
        const mailOptions = {
            from: req.user.email,
            to: req.body.to,
            subject: req.body.subject,
            body: req.body.body
        };

        // Send email
        await transporter.sendMail(mailOptions);

        console.log('Email sent successfully');
        res.status(200).json({
            status: "success"
        })
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(400).json({
            status: "failed"
        })
    }
};



const myInbox = async (req, res) => {
    const imap = new Imap({
        user: req.user.email,
        password: req.user.password,
        host: 'localserver.com',
        port: 143,
        tls: false // or true if you're using TLS
    });

    return new Promise((resolve, reject) => {
        imap.once('ready', () => {
            imap.openBox('INBOX', false, (err, box) => {
                if (err) {
                    imap.end();
                    reject(err);
                    return;
                }
                imap.search(['ALL'], (searchErr, results) => {
                    if (searchErr) {
                        imap.end();
                        reject(searchErr);
                        return;
                    }
                    const fetch = imap.fetch(results, {
                        bodies: ''
                    });
                    const emails = [];

                    fetch.on('message', (msg) => {
                        let email = { headers: {} };

                        msg.on('body', (stream) => {
                            let buffer = '';
                            stream.on('data', (chunk) => {
                                buffer += chunk.toString('utf8');
                            });
                            stream.once('end', async () => {
                                try {
                                    const parsed = await simpleParser(buffer);
                                    email.from = parsed.from.text;
                                    email.to = parsed.to.text;
                                    email.subject = parsed.subject;
                                    email.date = parsed.date;
                                    email.text = parsed.text;
                                    email.html = parsed.html;
                                } catch (parseErr) {
                                    console.error('Failed to parse email body:', parseErr);
                                }
                            });
                        });

                        msg.once('attributes', (attrs) => {
                            email.flags = attrs.flags;
                            email.read = attrs.flags.includes('\\Seen');
                        });

                        msg.once('end', () => {
                            emails.push(email);
                        });
                    });

                    fetch.once('end', () => {
                        imap.end();
                        res.status(200).json({
                            status: "success",
                            emails
                        });
                        resolve(emails);
                    });
                });
            });
        });

        imap.once('error', (err) => {
            imap.end();
            reject(err);
        });

        imap.connect();
    });
};














































const sentMails = async (req, res) => {
    const imap = new Imap({
        user: req.user.email,
        password: req.user.password,
        host: 'localserver.com',
        port: 143,
        tls: false // or true if you're using TLS
    });

    const handleError = (err, message) => {
        console.error(message, err);
        res.status(500).json({
            error: message
        });
        imap.end();
    };

    imap.once('ready', () => {
        imap.openBox('SENT', false, (err, box) => {
            if (err) {
                handleError(err, 'Failed to open SENT folder');
                return;
            }
            if (!box.messages.total) {
                // If there are no messages, respond immediately
                res.status(200).json({
                    status: 'success',
                    emails: []
                });
                imap.end();
                return;
            }

            const fetchOptions = {
                bodies: '',
                struct: true,
                envelope: true
            };
            const fetch = imap.seq.fetch('1:*', fetchOptions);
            const emails = [];
            let emailCounter = 0;

            fetch.on('message', (msg, seqno) => {
                let email = {};

                msg.on('body', (stream, info) => {
                    let buffer = '';
                    stream.on('data', (chunk) => {
                        buffer += chunk.toString('utf8');
                    });
                    stream.once('end', async () => {
                        try {
                            const parsedEmail = await simpleParser(buffer);
                            email.body = parsedEmail.text;
                            email.html = parsedEmail.html;
                            email.attachments = parsedEmail.attachments;
                        } catch (parseErr) {
                            console.error('Failed to parse email body:', parseErr);
                        }

                        emailCounter++;
                        if (emailCounter === box.messages.total) {
                            // All emails processed, send response
                            res.status(200).json({
                                status: 'success',
                                emails
                            });
                            imap.end();
                        }
                    });
                });

                msg.once('attributes', (attrs) => {
                    email.from = attrs.envelope.from[0].address;
                    email.to = attrs.envelope.to[0].address;
                    email.subject = attrs.envelope.subject;
                    email.date = attrs.envelope.date;
                    email.flags = attrs.flags;
                });

                msg.once('end', () => {
                    emails.push(email);
                });
            });

            fetch.once('end', () => {
                console.log('Done fetching all messages!');
            });

            fetch.once('error', (fetchErr) => {
                handleError(fetchErr, 'Error fetching messages');
            });
        });
    });

    imap.once('error', (err) => {
        handleError(err, 'IMAP connection error');
    });

    imap.once('end', () => {
        console.log('Connection ended');
    });

    imap.connect();
};





























const saveToDrafts = async (req, res) => {
    try {
        if (!req.user || !req.user.email || !req.user.password) {
            throw new Error('User email or password is missing');
        }

        const imap = new Imap({
            user: req.user.email,
            password: req.user.password,
            host: 'localserver.com',
            port: 143,
            tls: false // or true if you're using TLS
        });

        const handleError = (err, message) => {
            console.error(message, err);
            res.status(500).json({
                error: message
            });
            imap.end();
        };

        const { from, to, subject, text, html } = req.body;

        // Create the raw email string
        let transporter = nodemailer.createTransport({
            sendmail: true,
            newline: 'unix',
            path: '/usr/sbin/sendmail'
        });

        let emailMessage = {
            from,
            to,
            subject,
            text,
            html
        };

        transporter.sendMail(emailMessage, (err, info) => {
            if (err) {
                handleError(err, 'Failed to create email message');
                return;
            }

            let rawEmail = info.message.toString();

            imap.once('ready', () => {
                imap.openBox('DRAFTS', false, (err, box) => {
                    if (err) {
                        handleError(err, 'Failed to open DRAFTS folder');
                        return;
                    }

                    imap.append(rawEmail, { mailbox: 'DRAFTS' }, (err) => {
                        if (err) {
                            handleError(err, 'Failed to save email to DRAFTS');
                            return;
                        }

                        res.status(200).json({
                            status: 'success',
                            message: 'Email saved to drafts'
                        });
                        imap.end();
                    });
                });
            });

            imap.once('error', (err) => {
                handleError(err, 'IMAP connection error');
            });

            imap.once('end', () => {
                console.log('Connection ended');
            });

            imap.connect();
        });

    } catch (error) {
        console.error('Error:', error);
        
        res.status(500).json({
            error: error.message
        });
    }
};








module.exports = {
    sendMail,
    myInbox,
    sentMails,
    saveToDrafts
};