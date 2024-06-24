const nodemailer = require('nodemailer');
const MailComposer = require('nodemailer/lib/mail-composer');
const Imap = require('imap-simple');

async function sendAndFetchEmail() {
    // Configure Nodemailer with SMTP details
    let transporter = nodemailer.createTransport({
        host: 'your.smtp.server',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'your-email@example.com',
            pass: 'your-email-password'
        }
    });

    // Define the email options
    let mailOptions = {
        from: '"Sender Name" <your-email@example.com>',
        to: 'recipient@example.com',
        subject: 'Hello',
        text: 'Hello world?',
        html: '<b>Hello world?</b>'
    };

    // Send mail
    let info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);

    // Generate raw email content
    let mailComposer = new MailComposer(mailOptions);
    mailComposer.compile().build(async (err, message) => {
        if (err) {
            return console.error('Error building raw email:', err);
        }

        // Log the raw email content
        console.log('Raw email content:\n', message.toString('utf-8'));

        // Connect to IMAP
        const config = {
            imap: {
                user: 'your-email@example.com',
                password: 'your-email-password',
                host: 'your.imap.server',
                port: 993,
                tls: true,
                authTimeout: 3000
            }
        };

        try {
            const connection = await Imap.connect(config);

            // Open the "Sent Items" folder
            await connection.openBox('Sent Items');

            // Append the sent email to the "Sent Items" folder
            await connection.append(message, {
                mailbox: 'Sent Items',
                flags: ['\\Seen']
            });

            // Search for the appended email to fetch it
            const searchCriteria = ['ALL'];
            const fetchOptions = {
                bodies: ['HEADER', 'TEXT', ''],
                struct: true
            };

            const results = await connection.search(searchCriteria, fetchOptions);
            const fetchedEmail = results[0];

            // Log the fetched email attributes
            console.log('Fetched email:', fetchedEmail);

            await connection.end();
        } catch (imapError) {
            console.error('IMAP error:', imapError);
        }
    });
}

sendAndFetchEmail().catch(console.error);




https://docs.expo.dev/versions/latest/sdk/mail-composer/



const nodemailer = require('nodemailer');
const MailComposer = require('nodemailer/lib/mail-composer');
const Imap = require('imap-simple');

async function sendAndStoreEmail() {
    try {
        // Configure Nodemailer with SMTP details
        let transporter = nodemailer.createTransport({
            host: 'your.smtp.server',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: 'your-email@example.com',
                pass: 'your-email-password'
            }
        });

        // Define the email options
        let mailOptions = {
            from: '"Sender Name" <your-email@example.com>',
            to: 'recipient@example.com',
            subject: 'Hello',
            text: 'Hello world?',
            html: '<b>Hello world?</b>'
        };

        // Send mail
        let info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);

        // Generate raw email content
        let mailComposer = new MailComposer(mailOptions);
        mailComposer.compile().build(async (err, message) => {
            if (err) {
                return console.error('Error building raw email:', err);
            }

            // Log the raw email content
            console.log('Raw email content:\n', message.toString('utf-8'));

            // Connect to IMAP
            const config = {
                imap: {
                    user: 'your-email@example.com',
                    password: 'your-email-password',
                    host: 'your.imap.server',
                    port: 993,
                    tls: true,
                    authTimeout: 3000
                }
            };

            const connection = await Imap.connect(config);

            // Open the "Sent Items" folder
            await connection.openBox('Sent Items');

            // Append the sent email to the "Sent Items" folder
            await connection.append(message, {
                mailbox: 'Sent Items',
                flags: ['\\Seen']  // Ensure correct flags are set as per your IMAP server's requirements
            });

            // Close the IMAP connection
            await connection.end();

            console.log('Email has been successfully stored in Sent Items folder.');
        });
    } catch (error) {
        console.error('Error sending and storing email:', error);
    }
}

sendAndStoreEmail().catch(console.error);





