// const paypal = require('@paypal/checkout-server-sdk');

// const environment = new paypal.core.SandboxEnvironment(
//   process.env.PAYPAL_CLIENT_ID,
//   process.env.PAYPAL_SECRET
// );
// const client = new paypal.core.PayPalHttpClient(environment);

// module.exports = { paypal, client }; 


const Razorpay = require('razorpay');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = { razorpay };
