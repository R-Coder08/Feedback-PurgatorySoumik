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

// Route: Serve Index Page (Optional, express.static already does this)
app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route: Handle Form Submission
app.post('/submit-feedback', async (req, res) => {
        const { name, email, message } = req.body;
        
        // Nodemailer Transporter Setup
        const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                        user: process.env.GMAIL_USER,
                        pass: process.env.GMAIL_PASS // App Password (Not regular password)
                }
        });
        
        const mailOptions = {
                from: `"${name}" <${email}>`, // Sender name logic
                to: process.env.ADMIN_EMAIL, // Admin email
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
                // Success Response - Simple HTML Page
                res.send(`
            <div style="font-family: sans-serif; text-align: center; padding: 50px;">
                <h1 style="color: green;">Thank You!</h1>
                <p>Your feedback has been sent successfully.</p>
                <a href="/" style="text-decoration: none; color: blue;">Go Back</a>
            </div>
        `);
        } catch (error) {
                console.error(error);
                res.status(500).send(`
            <div style="font-family: sans-serif; text-align: center; padding: 50px;">
                <h1 style="color: red;">Error!</h1>
                <p>Something went wrong. Please try again later.</p>
                <a href="/" style="text-decoration: none; color: blue;">Go Back</a>
            </div>
        `);
        }
});

// Start Server
app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
});