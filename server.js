const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Enable CORS
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Configure email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL || 'lonkgoc@gmail.com',
        pass: process.env.EMAIL_PASSWORD // Your Gmail app password
    }
});

// Serve static files (if needed)
app.use(express.static('docs'));

// Test route
app.get('/test', (req, res) => {
    res.json({ message: 'Server is running!' });
});

// Handle form submissions
app.post('/api/submit-form', upload.single('file'), async (req, res) => {
    try {
        const { name, email, message } = req.body;
        console.log('Form data received:', { name, email, message }); // Debugging

        // Email options
        const mailOptions = {
            from: process.env.EMAIL || 'lonkgoc@gmail.com',
            to: process.env.EMAIL || 'lonkgoc@gmail.com',
            subject: 'New Contact Form Submission - LONK',
            text: `
Name: ${name}
Email: ${email}
Message: ${message}
            `,
            attachments: req.file ? [{
                filename: req.file.originalname,
                content: req.file.buffer
            }] : []
        };

        console.log('Mail options:', mailOptions); // Debugging

        // Send email
        await transporter.sendMail(mailOptions, (error, info) => { // Added callback
            if (error) {
                console.error('Error sending email:', error, error.stack);
                return res.status(500).json({ message: 'Error submitting form' });
            }
            console.log('Email sent:', info.response);
            res.status(200).json({ message: 'Form submitted successfully' });
        });


    } catch (error) {
        console.error('Error:', error, error.stack); // Include stack trace
        res.status(500).json({ message: 'Error submitting form' });
    }
});