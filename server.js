const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Configure multer for Azure Blob Storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Configure email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Serve static files
app.use(express.static('public'));

// Handle form submissions
app.post('/api/submit-form', upload.single('file'), async (req, res) => {
    try {
        const { name, email, message } = req.body;
        
        // Email options
        const mailOptions = {
            from: process.env.EMAIL,
            to: process.env.EMAIL,
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
        
        // Send email
        await transporter.sendMail(mailOptions);
        
        res.status(200).json({ message: 'Form submitted successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error submitting form' });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});