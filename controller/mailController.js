const nodemailer = require('nodemailer');
const Imap = require("imap")
const simpleParser = require('mailparser').simpleParser;


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
                        let email = {};

                        msg.on('body', (stream) => {
                            let buffer = '';
                            stream.on('data', (chunk) => {
                                buffer += chunk.toString('utf8');
                            });
                            stream.once('end', () => {
                                email.body = buffer;
                            });
                        });

                        msg.once('attributes', (attrs) => {
                            email.flags = attrs.flags;
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
    });

    imap.once('ready', () => {
        imap.openBox('SENT', false, (err, box) => {
            if (err) {
                res.status(500).json({
                    error: 'Failed to open SENT folder'
                });
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
                    // Use async/await to parse the email body
                    (async () => {
                        const parsedEmail = await simpleParser(stream);
                        email.body = parsedEmail.text;
                        email.attachments = parsedEmail.attachments;
                        emailCounter++;

                        if (emailCounter === box.messages.total) {
                            // All emails processed, send response
                            res.status(200).json(emails);
                        }
                    })();
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
                imap.end();
            });
        });
    });

    imap.once('error', (err) => {
        console.error('IMAP error:', err);
        res.status(500).json({
            error: 'IMAP connection error'
        });
    });

    imap.once('end', () => {
        console.log('Connection ended');
    });

    imap.connect();
};





module.exports = {
    sendMail,
    myInbox,
    sentMails
};