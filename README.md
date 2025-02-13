# Invoich App - Backend

The Invoich backend is a robust server-side application designed to support the comprehensive features of the Invoich platform. It provides APIs for managing invoices, users, admin roles, payments, email notifications, and more, with functionalities resembling Zoho's capabilities.

## Features

### Core Features
- **JWT Authentication**: 
  - Secure authentication using JSON Web Tokens for both users and admin roles.
  - Role-based access control to manage permissions.

- **Invoice Management**:
  - Create, update, delete, and retrieve invoices.
  - Generate PDF invoices with dynamic templates using **PDFKit**.
  - Send invoices directly to customers via email using **Nodemailer**.

- **Invoice Templates**:
  - Multiple customizable invoice templates.
  - Select templates dynamically while creating invoices.

- **Payment Integration**:
  - **Razorpay** for seamless online payments.
  - Automatically update invoice payment status upon successful transactions.

- **QR Code Generation**:
  - Generate QR codes for invoices and share them with customers.

- **Automated Reminders**:
  - Use **node-cron** to schedule reminders for overdue invoices.
  - Automated emails to customers for pending payments.

- **Bulk CSV Upload**:
  - Import customers, invoices, or items in bulk via CSV files using **csv-parser**.

- **Analytics and Reports**:
  - Generate financial reports in CSV or PDF format.
  - Data export functionality for admin users.

- **Cloudinary Integration**:
  - Manage and store uploaded files (e.g., logos, attachments) securely in the cloud.

- **Two-Factor Authentication**:
  - Enhance login security with **Twilio** for OTP-based two-factor authentication.

- **PDF and QR Code Downloads**:
  - Allow users to download invoices as PDFs or view their associated QR codes.

### Admin Features
- Manage all users and roles.
- Review and resolve customer complaints.
- View platform-wide analytics and reports.
- Monitor automated jobs and scheduled tasks.

### User Features
- Manage invoices, clients, expenses, and credit notes.
- Choose invoice templates and manage email notifications.
- Handle payments with integrated Razorpay or manual tracking.


## Libraries 

### Security and Authentication
- **bcryptjs**: For hashing passwords.
- **jsonwebtoken**: For secure token-based authentication.

### Payment Integration
- **razorpay**: Razorpay integration for handling payments.

### Email and Notifications
- **nodemailer**: For sending emails.
- **twilio**: For sending OTPs for two-factor authentication.

### File and Cloud Management
- **multer**: For file uploads.
- **multer-storage-cloudinary**: For storing files in Cloudinary.
- **cloudinary**: To manage and access uploaded assets.

### PDF and QR Code Generation
- **pdfkit**: For generating PDF documents.
- **qrcode**: For creating QR codes.

### Task Scheduling
- **node-cron**: For scheduling tasks like invoice reminders.
- **node-schedule**: For more advanced task scheduling.

### Data Manipulation
- **csv-parser**: For parsing CSV files.
- **json2csv**: For converting JSON data to CSV format.
- **date-fns**: For date manipulation and formatting.

### Development and Debugging
- **nodemon**: For auto-restarting the server during development.
- **dotenv**: For managing environment variables.

### Prerequisites
- Node.js (v18 or later)
- MongoDB (as the database)
- Cloudinary account (for file uploads)
- Razorpay and Twilio accounts (for payments and notifications)

## LIVE URL
```
https://invoich-backend-2.onrender.com
```



## Git Clone URL

```
https://github.com/swiftrut/Invoich-backend.git
```


## Install Commands
```
cd Invoich-backend
```

```
npm install
```

```
npm start

```

## Environment Variables
```
# Server Configuration
PORT = your port
DB_URL = your mongodb url

# JWT Configuration
JWT_SECRET = your jwt secret

# Email Configuration
EMAIL_USER = your email user
EMAIL_PASSWORD = your email password
EMAIL_SERVICE = your email service

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME = your cloudinary name
CLOUDINARY_API_KEY = your cloudinary key
CLOUDINARY_API_SECRET = your cloudinary scret

# Razorpay Configuration
RAZORPAY_KEY_ID = your razorpay key
RAZORPAY_KEY_SECRET = your razorpay secret
RAZORPAY_WEBHOOK_SECRET = your razorpay web secret


# WhatsApp Configuration
TWILIO_ACCOUNT_SID = your twilio sid
TWILIO_AUTH_TOKEN = your twilio token
TWILIO_WHATSAPP_FROM = your twilio whatsapp
WHATSAPP_SERVICE_PROVIDER = your twilio whatsapp service

```


### License

This project is licensed under the MIT License.
