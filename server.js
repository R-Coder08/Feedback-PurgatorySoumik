require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true })); // Form data parse karne ke liye
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Public folder serve karne ke liye

// Route: Serve Index Page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route: Handle Form Submission
app.post('/submit-feedback', async (req, res) => {
    const { name, email, message } = req.body;

    console.log(`Attempting to send email from: ${email}`); // Debugging log

    // Updated Nodemailer Transporter (Fix for Timeout)
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',  // Gmail ka specific host
        port: 465,               // Secure port
        secure: true,            // True for 465, false for other ports
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS // Render Environment Variable se aayega
        }
    });

    const mailOptions = {
        from: `"${name}" <${process.env.GMAIL_USER}>`, // Sender: authenticated user (Gmail policy)
        replyTo: email, // User ka email reply-to mein hoga
        to: process.env.ADMIN_EMAIL,
        subject: `New Feedback from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        html: `
            <h3>New Feedback Received</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully!');
        
        // Success Response
        res.send(`
            <div style="font-family: sans-serif; text-align: center; padding: 50px;">
                <h1 style="color: green;">Thank You!</h1>
                <p>Your feedback has been sent successfully.</p>
                <a href="/" style="text-decoration: none; color: blue;">Go Back</a>
            </div>
        `);
    } catch (error) {
        console.error("Email Error Details:", error); // Error log Render console mein dikhega
        
        // Error Response
        res.status(500).send(`
            <div style="font-family: sans-serif; text-align: center; padding: 50px;">
                <h1 style="color: red;">Error!</h1>
                <p>Could not send email. Connection Timeout or Auth Error.</p>
                <p>Error: ${error.message}</p>
                <a href="/" style="text-decoration: none; color: blue;">Go Back</a>
            </div>
        `);
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
