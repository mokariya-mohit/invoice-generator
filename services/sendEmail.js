const nodemailer = require('nodemailer');

/**
 * Sends an email with optional text and PDF attachment.
 * @param {string} to - Recipient's email address.
 * @param {string} subject - Subject of the email.
 * @param {string} text - Email message text.
 * @param {string} [pdfPath] - Optional: Path to the PDF file for attachment.
 */
const sendEmail = async (to, subject, text, pdfPath = null) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD, 
        },
    });

    const htmlContent = `
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f9;
                    color: #333;
                    margin: 0;
                    padding: 20px;
                }
                .email-container {
                    background-color: #ffffff;
                    border-radius: 8px;
                    padding: 20px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }
                h1 {
                    color: #4CAF50;
                }
                p {
                    font-size: 16px;
                    line-height: 1.5;
                    color: #555;
                }
                .footer {
                    margin-top: 20px;
                    font-size: 12px;
                    text-align: center;
                    color: #888;
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <h1>${subject}</h1>
                <p>${text}</p>
                <div class="footer">
                    <p>Thank you for using our service!</p>
                </div>
            </div>
        </body>
        </html>
    `;

    // Prepare the email options
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text, 
        html: htmlContent, 
        attachments: pdfPath
            ? [
                  {
                      filename: pdfPath.split('/').pop(), 
                      path: pdfPath,
                  },
              ]
            : [], 
    };

    try {
        await transporter.sendMail(mailOptions);
      
    } catch (error) {
        console.error('Error sending email:', error.message);
        throw new Error('Failed to send email');
    }
};

module.exports = sendEmail;
