const mongoose = require('mongoose');
const { Schema } = mongoose;

// Address schema for billing and shipping addresses
const addressSchema = new Schema(
  {
    attention: {
      type: String,
    },
    countryRegion: {
      type: String,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    pinCode: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
  },
  { _id: false }
);

// Customer schema
const customerSchema = new Schema(
  {
    customerType: {
      type: String,
      enum: ['business', 'individual'],
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    companyName: {
      type: String,
    },
    displayName: {
      type: String,
    },
    currency: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
    },
    mobileNumber: {
      type: String,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'userModel',
      required: true,
    },
    otherDetails: [
      {
        paymentTerms: {
          type: String,
        },
        remarks: {
          type: String, 
        },
      },
      
    ],
    addresses: [
      {
        billingAddress: addressSchema, 
        shippingAddress: addressSchema, 
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Customer', customerSchema);
