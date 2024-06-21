to fetch mails as threads 

const imaps = require('imap-simple');
const { simpleParser } = require('mailparser');

const config = {
    imap: {
        user: 'your-email@example.com',
        password: 'your-email-password',
        host: 'imap.example.com',
        port: 993,
        tls: true,
        authTimeout: 3000
    }
};

async function fetchEmails() {
    try {
        const connection = await imaps.connect({ imap: config.imap });
        await connection.openBox('INBOX');

        const searchCriteria = ['ALL'];
        const fetchOptions = {
            bodies: ['HEADER', 'TEXT', ''],
            struct: true
        };

        const messages = await connection.search(searchCriteria, fetchOptions);
        const emailMap = {};

        for (const item of messages) {
            const all = item.parts.find(part => part.which === '');
            const id = item.attributes.uid;
            const idHeader = "Imap-Id: " + id + "\r\n";

            const email = await simpleParser(idHeader + all.body);
            const { messageId, inReplyTo, references } = email;

            emailMap[messageId] = {
                email,
                inReplyTo,
                references: references || [],
                children: []
            };

            if (inReplyTo && emailMap[inReplyTo]) {
                emailMap[inReplyTo].children.push(emailMap[messageId]);
            }

            for (const ref of emailMap[messageId].references) {
                if (emailMap[ref]) {
                    emailMap[ref].children.push(emailMap[messageId]);
                }
            }
        }

        const threads = Object.values(emailMap).filter(email => !email.inReplyTo);
        return threads;

    } catch (error) {
        console.error('Error fetching emails:', error);
    }
}

fetchEmails().then(threads => {
    console.log('Email Threads:', JSON.stringify(threads, null, 2));
}).catch(err => console.error(err));





google --


const imapConfig = {
    imap: {
        user: username,
        password: password,
        host: 'imap.gmail.com', // Replace with your IMAP server host
        port: 993,
        tls: true,
        authTimeout: 3000 // Optional: Set a timeout for authentication
    }
};


const threadMap = {};

function addToThreadMap(message) {
    const references = message.parts[0].headers.get('References');
    if (references) {
        const topMessageId = references.split(' ').pop(); // Extract the top-level message ID
        if (!threadMap[topMessageId]) {
            threadMap[topMessageId] = [];
        }
        threadMap[topMessageId].push(message);
    }
}


imap.connect(imapConfig).then(connection => {
    return connection.openBox('INBOX');
}).then(box => {
    // Search for messages (you can customize search criteria here)
    const searchCriteria = ['ALL']; // Fetch all messages
    const fetchOptions = { bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'] };

    return connection.search(searchCriteria, fetchOptions);
}).then(results => {
    const threads = threadMap ? Object.values(threadMap) : results;

    threads.forEach(thread => {
        console.log('--- Thread Start ---');

        thread.forEach(message => {
            const parts = message.parts[0]; // Assuming the first part contains the body
            console.log('From:', parts.headers.get('From'));
            console.log('Subject:', parts.headers.get('Subject'));
            console.log('Date:', parts.headers.get('Date'));

            // Access message body if needed
            if (fetchOptions.bodies.includes('TEXT')) {
                const stream = parts.body;
                let buffer = '';
                stream.on('data', chunk => {
                    buffer += chunk.toString('utf8');
                });
                stream.on('end', () => {
                    console.log('Body:', buffer);
                });
            }
        });

        console.log('--- Thread End ---');
    });

    // Close the connection
    return connection.close();
}).catch(err => {
    console.error('Error:', err);
});





fetch related mail threads using refference headers -->

const imap = require('imap-simple');

// ... other configuration code

imap.connect(imapConfig).then(connection => {
    return connection.openBox('INBOX');
}).then(box => {
    const messageId = 'your_message_id'; // Replace with the actual message ID

    // Search for messages with the messageId in the References header
    const searchCriteria = ['HEADER', 'References', messageId];
    const fetchOptions = { bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'] };

    return connection.search(searchCriteria, fetchOptions);
}).then(results => {
    results.forEach(message => {
        const parts = message.parts[0]; // Assuming the first part contains the body
        console.log('From:', parts.headers.get('From'));
        console.log('Subject:', parts.headers.get('Subject'));
        console.log('Date:', parts.headers.get('Date'));

        // Access message body if needed
        if (fetchOptions.bodies.includes('TEXT')) {
            const stream = parts.body;
            let buffer = '';
            stream.on('data', chunk => {
                buffer += chunk.toString('utf8');
            });
            stream.on('end', () => {
                console.log('Body:', buffer);
            });
        }
    });

    // Close the connection
    return connection.close();
}).catch(err => {
    console.error('Error:', err);
});




fetching threads using mail headers.

const imap = require('imap-simple');

// ... other configuration code

imap.connect(imapConfig).then(connection => {
    return connection.openBox('INBOX');
}).then(box => {
    const messageId = 'your_message_id'; // Replace with the actual message ID

    // Use UID FETCH to retrieve the message and its threaded structure
    return connection.uid('FETCH', `${messageId} (FLAGS UID FETCH (BODY.PEEK[] FLAGS))`);
}).then(results => {
    const messageUid = results[0].attributes.uid;

    // Search for messages with the same thread UID
    const searchCriteria = ['UID', 'THREAD', messageUid];
    const fetchOptions = { bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'] };

    return connection.search(searchCriteria, fetchOptions);
}).then(results => {
    // Process the retrieved threads as usual
    // ...

    // Close the connection
    return connection.close();
}).catch(err => {
    console.error('Error:', err);
});







fetching all related mails google style : 



const express = require('express');
const imaps = require('imap-simple');
const { simpleParser } = require('mailparser');

const app = express();
const PORT = 3000;

const config = {
    imap: {
        user: 'your-email@example.com',
        password: 'your-email-password',
        host: 'imap.example.com',
        port: 993,
        tls: true,
        authTimeout: 3000
    }
};

let emailThreads = {};

async function fetchEmails() {
    try {
        const connection = await imaps.connect({ imap: config.imap });
        await connection.openBox('INBOX');

        const searchCriteria = ['ALL'];
        const fetchOptions = {
            bodies: ['HEADER', 'TEXT', ''],
            struct: true
        };

        const messages = await connection.search(searchCriteria, fetchOptions);
        const emailMap = {};

        for (const item of messages) {
            const all = item.parts.find(part => part.which === '');
            const id = item.attributes.uid;
            const idHeader = "Imap-Id: " + id + "\r\n";

            const email = await simpleParser(idHeader + all.body);
            const { messageId, inReplyTo, references } = email;

            emailMap[messageId] = {
                email,
                inReplyTo,
                references: references || [],
                children: []
            };

            if (inReplyTo && emailMap[inReplyTo]) {
                emailMap[inReplyTo].children.push(emailMap[messageId]);
            }

            for (const ref of emailMap[messageId].references) {
                if (emailMap[ref]) {
                    emailMap[ref].children.push(emailMap[messageId]);
                }
            }
        }

        emailThreads = Object.values(emailMap).filter(email => !email.inReplyTo);
    } catch (error) {
        console.error('Error fetching emails:', error);
    }
}

app.use(express.static('public'));

app.get('/emails', (req, res) => {
    res.json(emailThreads);
});

app.get('/thread/:messageId', (req, res) => {
    const messageId = req.params.messageId;
    const thread = findThreadById(messageId, emailThreads);
    res.json(thread);
});

function findThreadById(messageId, threads) {
    for (const thread of threads) {
        if (thread.email.messageId === messageId) {
            return thread;
        }
        const found = findThreadById(messageId, thread.children);
        if (found) {
            return found;
        }
    }
    return null;
}

fetchEmails().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}).catch(err => console.error(err));






setting starred message 


const ImapSimple = require('imap-simple');

// Replace with your email credentials
const imapConfig = {
  imap: {
    user: 'your_username@example.com',
    password: 'your_password',
    host: 'imap.example.com', // Replace with your IMAP server host
    port: 993, // Standard IMAP port (may vary depending on your provider)
    tls: true, // Use secure connection (TLS)
  },
};

// Function to set the "star" flag on an email by message ID
async function setStarFlagByMessageId(messageId) {
  const connection = await ImapSimple.connect(imapConfig);

  try {
    await connection.openBox('INBOX'); // Replace 'INBOX' with the desired mailbox

    // Search for the email using the message ID
    const searchResults = await connection.search(['UID', messageId]);

    if (searchResults.length === 0) {
      console.log('No email found with the provided message ID.');
      return;
    }

    // Set the "star" flag on the found email
    await connection.setFlags(searchResults, ['\\Seen', '\\Starred']); // Mark as read and starred
    console.log('Starred email successfully!');
  } catch (error) {
    console.error('Error setting star flag:', error);
  } finally {
    await connection.end();
  }
}

// Example usage: Provide the message ID of the email you want to star
const messageId = '12345'; // Replace with the actual message ID

setStarFlagByMessageId(messageId);




removing starred mail : 



const ImapSimple = require('imap-simple');

// Replace with your email credentials
const imapConfig = {
  imap: {
    user: 'your_username@example.com',
    password: 'your_password',
    host: 'imap.example.com', // Replace with your IMAP server host
    port: 993, // Standard IMAP port (may vary depending on your provider)
    tls: true, // Use secure connection (TLS)
  },
};

// Function to set the "star" flag on an email by message ID
async function setStarFlagByMessageId(messageId) {
  const connection = await ImapSimple.connect(imapConfig);

  try {
    await connection.openBox('INBOX'); // Replace 'INBOX' with the desired mailbox

    // Search for the email using the message ID
    const searchResults = await connection.search(['UID', messageId]);

    if (searchResults.length === 0) {
      console.log('No email found with the provided message ID.');
      return;
    }

    // Set the "star" flag on the found email
    await connection.setFlags(searchResults, ['\\Seen', '\\Starred']); // Mark as read and starred
    console.log('Starred email successfully!');
  } catch (error) {
    console.error('Error setting star flag:', error);
  } finally {
    await connection.end();
  }
}

// Example usage: Provide the message ID of the email you want to star
const messageId = '12345'; // Replace with the actual message ID

setStarFlagByMessageId(messageId);




reply to mails google  ::



const ImapSimple = require('imap-simple');
const nodeEmailReplyParser = require('node-email-reply-parser');
const nodemailer = require('nodemailer');

// Replace with your email credentials and IMAP/SMTP server details
const imapConfig = { /* ... */ };  // Replace with your IMAP config
const smtpConfig = { /* ... */ }; // Replace with your SMTP config

async function replyToEmailByMessageId(messageId) {
  const connection = await ImapSimple.connect(imapConfig);

  try {
    await connection.openBox('INBOX'); // Replace 'INBOX' with the desired mailbox

    // Search for the email using the message ID
    const searchResults = await connection.search(['UID', messageId]);

    if (searchResults.length === 0) {
      console.log('No email found with the provided message ID.');
      return;
    }

    // Fetch the email data
    const emailData = await connection.fetch(searchResults, { body: true });

    // Parse email content using node-email-reply-parser
    const parsedEmail = nodeEmailReplyParser(emailData[0].body[0]);

    // Compose your reply content (including quoting parts from original email if needed)
    const replyContent = `Hi ${parsedEmail.from.text},

    Replying to your email titled "${parsedEmail.subject.text}":

    ${parsedEmail.getVisibleText()} // Include relevant parts of original email

    Here's my response...`;

    // Configure and send the reply using nodemailer
    const transporter = nodemailer.createTransport(smtpConfig);
    const mailOptions = {
      from: 'your_email@example.com', // Replace with your email address
      to: parsedEmail.from.text, // Recipient address from parsed email
      subject: `Re: ${parsedEmail.subject.text}`, // Prepend "Re:" to subject
      text: replyContent, // Reply content
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Reply sent:', info.response);
  } catch (error) {
    console.error('Error replying to email:', error);
  } finally {
    await connection.end();
  }
}

// Example usage: Provide the message ID of the email you want to reply to
const messageId = '12345'; // Replace with the actual message ID

replyToEmailByMessageId(messageId);





using different approach :: 

const nodemailer = require('nodemailer');

const smtpConfig = {
    host: 'smtp.example.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'your-email@example.com',
        pass: 'your-email-password'
    }
};

async function sendReply(originalEmail, replyText) {
    const transporter = nodemailer.createTransport(smtpConfig);

    const mailOptions = {
        from: 'your-email@example.com',
        to: originalEmail.from.value[0].address, // The original sender
        subject: 'Re: ' + originalEmail.subject,
        text: replyText,
        inReplyTo: originalEmail.messageId,
        references: originalEmail.references ? [...originalEmail.references, originalEmail.messageId].join(' ') : originalEmail.messageId
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

// Example usage
fetchEmailById('<message1@example.com>').then(email => {
    if (email) {
        sendReply(email, 'This is a reply to your email.');
    }
}).catch(err => console.error(err));






to send mail to cc and bcc

const nodemailer = require('nodemailer');

// Create a transporter object
let transporter = nodemailer.createTransport({
    host: 'smtp.your-email-provider.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'your-email@example.com', // your email
        pass: 'your-email-password'     // your email password
    }
});

// Define the email options
let mailOptions = {
    from: '"Sender Name" <your-email@example.com>', // sender address
    to: 'recipient1@example.com',                   // list of primary recipients
    cc: 'ccrecipient@example.com',                  // list of CC recipients
    bcc: 'bccrecipient@example.com',                // list of BCC recipients
    subject: 'Hello',                               // Subject line
    text: 'Hello world?',                           // plain text body
    html: '<b>Hello world?</b>'                     // html body
};

// Send the email
transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
});
