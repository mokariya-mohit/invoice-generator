const CreditNote = require('../models/creditNoteModel');
const Invoice = require('../models/invoiceModel');
const Item = require('../models/itemModel');
const User = require('../models/userModel');
const { Readable } = require('stream');
const csv = require('csv-parser');
const mongoose = require('mongoose');




const MAX_UNIT_VALUE = 1000000;

// Create a new Credit Note
// const createCreditNote = async (req, res) => {
//   try {
//     const { invoiceID } = req.body;

//     const invoiceDetails = await Invoice.findById(invoiceID);
//     if (!invoiceDetails) {
//       return res.status(404).json({ error: 'Invoice not found' });
//     }

//     const plainInvoiceDetails = invoiceDetails.toObject();

//     for (const invoiceItem of plainInvoiceDetails.items) {
//       const { item, quantity } = invoiceItem;

//       const itemRecord = await Item.findById(item);
//       if (!itemRecord) {
//         return res.status(404).json({ error: `Item with ID ${item} not found` });
//       }

//       const currentUnit = Number(itemRecord.unit);
//       const itemQuantity = Number(quantity);

//       const newUnit = currentUnit + itemQuantity;

//       itemRecord.unit = newUnit > MAX_UNIT_VALUE ? MAX_UNIT_VALUE : newUnit;

//       await itemRecord.save();
//     }

//     const creditNote = new CreditNote({
//       creditNoteID: `CN-${Date.now()}`,
//       invoiceID,
//       invoiceDetails: plainInvoiceDetails,
//     });

//     const savedCreditNote = await creditNote.save();

//     res.status(201).json(savedCreditNote);
//   } catch (error) {
//     console.error('Error creating credit note:', error);
//     res.status(500).json({ error: error.message });
//   }
// };


// Import Credit Notes from CSV
// const importCreditNotesFromCSV = async (req, res) => {

//   // Check if file is uploaded
//   if (!req.file) {
//     return res.status(400).json({ message: "No file uploaded" });
//   }

//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const userId = req.business.userId;

//     if (!userId) {
//       return res.status(400).json({ message: "User ID is required" });
//     }

//     const results = [];
//     const stream = Readable.from(req.file.buffer.toString('utf-8'));

//     stream
//       .pipe(csv())
//       .on('data', async (row) => {
//         const { invoiceID, item, quantity, price, tax, total } = row;

//         // console.log('Processing row:', row);

//         // Validate row data
//         if (!invoiceID || !item || !quantity || !price || !tax || !total) {
//           console.warn('Skipping row with missing fields:', row);
//           return; // Skip this row if any required field is missing
//         }

//         // Convert fields to their appropriate types
//         const quantityInt = parseInt(quantity, 10);
//         const priceFloat = parseFloat(price);
//         const taxFloat = parseFloat(tax);
//         const totalFloat = parseFloat(total);

//         // Further validation on parsed data
//         if (isNaN(quantityInt) || isNaN(priceFloat) || isNaN(taxFloat) || isNaN(totalFloat)) {
//           console.warn('Skipping row with invalid numeric data:', row);
//           return;
//         }

//         // Retrieve invoice details
//         const invoiceDetails = await Invoice.findById(invoiceID).populate('items.item');
//         console.log(invoiceDetails);
//         if (!invoiceDetails) {
//           console.error(`Invoice with ID ${invoiceID} not found`);
//           return res.status(404).json({ message: `Invoice with ID ${invoiceID} not found` });
//         }

       

//         // Retrieve item from inventory
//         const itemRecord = await Item.findById(item); // Ensure the correct item ID is used
//         if (!itemRecord) {
//           console.error(`Item with ID ${item} not found`);
//           return res.status(404).json({ message: `Item with ID ${item} not found` });
//         }

//         // Check if the quantity is valid
//         const originalItem = invoiceDetails.items.find(invoiceItem => invoiceItem.item.toString() === item);
//         console.log(2);

//         console.log(originalItem);
        
//         if (!originalItem) {
//           console.warn(`Item ID ${item} not found in invoice ${invoiceID}`);
//           return res.status(404).json({ message: `Item ID ${item} not found in invoice ${invoiceID}` });
//         }

//         const originalQuantity = originalItem.quantity;

//         if (originalQuantity === undefined) {
//           console.warn(`Original quantity not found for item ${item}`);
//           return res.status(400).json({ message: `Original quantity not found for item ${item}` });
//         }

//         if (quantityInt > originalQuantity || quantityInt <= 0) {
//           console.warn(`Invalid return quantity for item ${item}. Must be between 1 and ${originalQuantity}.`);
//           return res.status(400).json({ message: `Invalid return quantity for item ${item}. Must be between 1 and ${originalQuantity}.` });
//         }

//         // Update item stock after validation
//         itemRecord.stock += quantityInt;
//         await itemRecord.save();

//         // Prepare credit note object
//         results.push({
//           creditNoteID: `CN-${Date.now()}`,  
//           invoiceID,
//           userId,
//           invoiceDetails: {
//             items: [{
//               item,
//               quantity: quantityInt,
//               price: priceFloat,
//               tax: taxFloat,
//               total: totalFloat,
//             }],
//           },
//         });
//       })
//       .on('end', async () => {
//         try {
//           if (results.length === 0) {
//             return res.status(400).json({ message: "No valid credit notes to save" });
//           }

//           // Save the valid credit notes in bulk
//           const savedCreditNotes = await CreditNote.insertMany(results);
//           res.status(201).json({
//             message: "Credit notes imported successfully",
//             results: savedCreditNotes,
//           });
//         } catch (error) {
//           console.error('Error saving credit notes:', error);
//           return res.status(500).json({ message: 'Error saving credit notes', error: error.message });
//         }
//       })
//       .on('error', (error) => {
//         console.error("Error reading CSV file:", error);
//         return res.status(500).json({ error: "Failed to read CSV file" });
//       });
//   } catch (error) {
//     console.error('Error importing credit notes:', error);
//     return res.status(500).json({ message: 'Error importing credit notes', error: error.message });
//   }
// };


// const importCreditNotesFromCSV = async (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ message: "No file uploaded" });
//   }

//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const userId = req.business.userId;

//     if (!userId) {
//       return res.status(400).json({ message: "User ID is required" });
//     }

//     const results = [];
//     const errors = [];
//     const stream = Readable.from(req.file.buffer.toString("utf-8"));

//     stream
//       .pipe(csv())
//       .on("data", async (row) => {
//         const { invoiceID, item, quantity, price, tax, total } = row;


//         if (!invoiceID || !item || !quantity || !price || !tax || !total) {
//           console.warn("Skipping row with missing fields:", row);
//           errors.push({ row, message: "Missing required fields" });
//           return;
//         }

//         const quantityInt = parseInt(quantity, 10);
//         const priceFloat = parseFloat(price);
//         const taxFloat = parseFloat(tax);
//         const totalFloat = parseFloat(total);

//         if (
//           isNaN(quantityInt) ||
//           isNaN(priceFloat) ||
//           isNaN(taxFloat) ||
//           isNaN(totalFloat)
//         ) {
//           console.warn("Skipping row with invalid numeric data:", row);
//           errors.push({ row, message: "Invalid numeric data" });
//           return;
//         }

//         const itemObjectId = new mongoose.Types.ObjectId(item);
//         const invoiceObjectId = new mongoose.Types.ObjectId(invoiceID);

//         const invoiceDetails = await Invoice.findById(invoiceObjectId);

//         if (!invoiceDetails) {
//           console.error(`Invoice with ID ${invoiceID} not found`);
//           errors.push({ row, message: `Invoice with ID ${invoiceID} not found` });
//           return;
//         }

//         const originalItem = invoiceDetails.items.find((invoiceItem) =>
//           invoiceItem.item.equals(itemObjectId)
//         );

//         if (!originalItem) {
//           console.warn(`Item ID ${item} not found in invoice ${invoiceID}`);
//           errors.push({ row, message: `Item ID ${item} not found` });
//           return;
//         }

//         const originalQuantity = originalItem.quantity;

//         if (quantityInt > originalQuantity || quantityInt <= 0) {
//           console.warn(
//             `Invalid return quantity for item ${item}. Must be between 1 and ${originalQuantity}.`
//           );
//           errors.push({
//             row,
//             message: `Invalid return quantity. Must be between 1 and ${originalQuantity}.`,
//           });
//           return;
//         }

//         const itemRecord = await Item.findById(itemObjectId);
//         if (!itemRecord) {
//           console.error(`Item with ID ${item} not found in inventory`);
//           errors.push({
//             row,
//             message: `Item with ID ${item} not found in inventory`,
//           });
//           return;
//         }

//         itemRecord.stock += quantityInt;
//         await itemRecord.save();

//         results.push({
//           creditNoteID: `CN-${Date.now()}`,
//           invoiceID: invoiceObjectId,
//           userId,
//           invoiceDetails: {
//             items: [
//               {
//                 item: itemObjectId,
//                 quantity: quantityInt,
//                 price: priceFloat,
//                 tax: taxFloat,
//                 total: totalFloat,
//               },
//             ],
//           },
//         });        
//         console.log(results.length);
//       })

      
//       .on("end", async () => {
//         try {
//           console.log("Finished processing rows.");
//           console.log("Results:", results);
//           console.log("Errors:", errors);
//           console.log(results.length);

//           if (results.length === 0) {
//             return res.status(400).json({
//               message: "No valid credit notes to save",
//               errors,
//             });
//           }

//           const savedCreditNotes = await CreditNote.insertMany(results);
//           await session.commitTransaction();

//           res.status(201).json({
//             message: "Credit notes imported successfully",
//             results: savedCreditNotes,
//           });
//         } catch (error) {
//           console.error("Error saving credit notes:", error);
//           await session.abortTransaction();
//           return res.status(500).json({
//             message: "Error saving credit notes",
//             error: error.message,
//           });
//         } finally {
//           session.endSession();
//         }
//       })
//       .on("error", async (error) => {
//         console.error("Error reading CSV file:", error);
//         await session.abortTransaction();
//         return res.status(500).json({
//           error: "Failed to read CSV file",
//           message: error.message,
//         });
//       });
//   } catch (error) {
//     console.error("Error importing credit notes:", error);
//     await session.abortTransaction();
//     return res.status(500).json({
//       message: "Error importing credit notes",
//       error: error.message,
//     });
//   } finally {
//     session.endSession();
//   }
// };

// const importCreditNotesFromCSV = async (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ message: "No file uploaded" });
//   }

//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const userId = req.business.userId;

//     if (!userId) {
//       return res.status(400).json({ message: "User ID is required" });
//     }

//     const results = [];
//     const errors = [];
//     const stream = Readable.from(req.file.buffer.toString("utf-8"));

//     stream
//       .pipe(csv())
//       .on("data", async (row) => {
//         console.log("Processing row:", row);  // Log each incoming row

//         const { invoiceID, item, quantity, price, tax, total } = row;

//         // Check for missing required fields
//         if (!invoiceID || !item || !quantity || !price || !tax || !total) {
//           console.warn("Skipping row with missing fields:", row);
//           errors.push({ row, message: `Missing required fields: ${JSON.stringify(row)}` });
//           return;
//         }

//         const quantityInt = parseInt(quantity, 10);
//         const priceFloat = parseFloat(price);
//         const taxFloat = parseFloat(tax);
//         const totalFloat = parseFloat(total);

//         // Check for invalid numeric data
//         if (
//           isNaN(quantityInt) ||
//           isNaN(priceFloat) ||
//           isNaN(taxFloat) ||
//           isNaN(totalFloat)
//         ) {
//           console.warn("Skipping row with invalid numeric data:", row);
//           errors.push({ row, message: "Invalid numeric data" });
//           return;
//         }

//         const itemObjectId = new mongoose.Types.ObjectId(item);
//         const invoiceObjectId = new mongoose.Types.ObjectId(invoiceID);

//         console.log("Converting invoiceID:", invoiceID);
//         console.log("Converting item:", item);

//         // Fetch the invoice details
//         const invoiceDetails = await Invoice.findById(invoiceObjectId);

//         if (!invoiceDetails) {
//           console.error(`Invoice with ID ${invoiceID} not found`);
//           errors.push({ row, message: `Invoice with ID ${invoiceID} not found` });
//           return;
//         }

//         // Check if the item exists in the invoice
//         const originalItem = invoiceDetails.items.find((invoiceItem) =>
//           invoiceItem.item.equals(itemObjectId)
//         );

//         if (!originalItem) {
//           console.warn(`Item ID ${item} not found in invoice ${invoiceID}`);
//           errors.push({ row, message: `Item ID ${item} not found in invoice ${invoiceID}` });
//           return;
//         }

//         const originalQuantity = originalItem.quantity;

//         // Validate quantity
//         if (quantityInt > originalQuantity || quantityInt <= 0) {
//           console.warn(
//             `Invalid return quantity for item ${item}. Must be between 1 and ${originalQuantity}.`
//           );
//           errors.push({
//             row,
//             message: `Invalid return quantity. Must be between 1 and ${originalQuantity}.`,
//           });
//           return;
//         }

//         // Check if the item exists in the inventory
//         const itemRecord = await Item.findById(itemObjectId);
//         if (!itemRecord) {
//           console.error(`Item with ID ${item} not found in inventory`);
//           errors.push({
//             row,
//             message: `Item with ID ${item} not found in inventory`,
//           });
//           return;
//         }

//         // Update the stock of the item
//         itemRecord.stock += quantityInt;
//         await itemRecord.save();

//         // Prepare results
//         const creditNote = {
//           creditNoteID: `CN-${Date.now()}`,
//           invoiceID: invoiceObjectId,
//           userId,
//           invoiceDetails: {
//             items: [
//               {
//                 item: itemObjectId,
//                 quantity: quantityInt,
//                 price: priceFloat,
//                 tax: taxFloat,
//                 total: totalFloat,
//               },
//             ],
//           },
//         };

//         console.log("Adding credit note:", creditNote);  // Log the credit note being added
//         results.push(creditNote);
//       })

//       .on("end", async () => {
//         try {
//           console.log("Finished processing rows.");
//           console.log("Results:", results);
//           console.log("Errors:", errors);
//           console.log("Total results:", results.length);

//           if (results.length === 0) {
//             return res.status(400).json({
//               message: "No valid credit notes to save",
//               errors,
//             });
//           }

//           const savedCreditNotes = await CreditNote.insertMany(results);
//           await session.commitTransaction();

//           res.status(201).json({
//             message: "Credit notes imported successfully",
//             results: savedCreditNotes,
//           });
//         } catch (error) {
//           console.error("Error saving credit notes:", error);
//           await session.abortTransaction();
//           return res.status(500).json({
//             message: "Error saving credit notes",
//             error: error.message,
//           });
//         } finally {
//           session.endSession();
//         }
//       })
//       .on("error", async (error) => {
//         console.error("Error reading CSV file:", error);
//         await session.abortTransaction();
//         return res.status(500).json({
//           error: "Failed to read CSV file",
//           message: error.message,
//         });
//       });
//   } catch (error) {
//     console.error("Error importing credit notes:", error);
//     await session.abortTransaction();
//     return res.status(500).json({
//       message: "Error importing credit notes",
//       error: error.message,
//     });
//   } finally {
//     session.endSession();
//   }
// };

// const importCreditNotesFromCSV = async (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ message: "No file uploaded" });
//   }

//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const userId = req.business.userId;

//     if (!userId) {
//       return res.status(400).json({ message: "User ID is required" });
//     }

//     const results = [];
//     const errors = [];
//     const stream = Readable.from(req.file.buffer.toString("utf-8"));

//     stream
//       .pipe(csv())
//       .on("data", async (row) => {
//         console.log("Processing row:", row);  // Log each incoming row

//         const { invoiceID, item, quantity, price, tax, total } = row;

//         // Check for missing required fields
//         if (!invoiceID || !item || !quantity || !price || !tax || !total) {
//           console.warn("Skipping row with missing fields:", row);
//           errors.push({ row, message: `Missing required fields: ${JSON.stringify(row)}` });
//           return;
//         }

//         const quantityInt = parseInt(quantity, 10);
//         const priceFloat = parseFloat(price);
//         const taxFloat = parseFloat(tax);
//         const totalFloat = parseFloat(total);

//         // Check for invalid numeric data
//         if (
//           isNaN(quantityInt) ||
//           isNaN(priceFloat) ||
//           isNaN(taxFloat) ||
//           isNaN(totalFloat)
//         ) {
//           console.warn("Skipping row with invalid numeric data:", row);
//           errors.push({ row, message: "Invalid numeric data" });
//           return;
//         }

//         const itemObjectId = new mongoose.Types.ObjectId(item);
//         const invoiceObjectId = new mongoose.Types.ObjectId(invoiceID);

//         console.log("Converting invoiceID:", invoiceID);
//         console.log("Converting item:", item);

//         // Fetch the invoice details
//         const invoiceDetails = await Invoice.findById(invoiceObjectId);

//         if (!invoiceDetails) {
//           console.error(`Invoice with ID ${invoiceID} not found`);
//           errors.push({ row, message: `Invoice with ID ${invoiceID} not found` });
//           return;
//         }

//         // Check if the item exists in the invoice
//         const originalItem = invoiceDetails.items.find((invoiceItem) =>
//           invoiceItem.item.equals(itemObjectId)
//         );

//         if (!originalItem) {
//           console.warn(`Item ID ${item} not found in invoice ${invoiceID}`);
//           errors.push({ row, message: `Item ID ${item} not found in invoice ${invoiceID}` });
//           return;
//         }

//         const originalQuantity = originalItem.quantity;

//         // Validate quantity
//         if (quantityInt > originalQuantity || quantityInt <= 0) {
//           console.warn(
//             `Invalid return quantity for item ${item}. Must be between 1 and ${originalQuantity}.`
//           );
//           errors.push({
//             row,
//             message: `Invalid return quantity. Must be between 1 and ${originalQuantity}.`,
//           });
//           return;
//         }

//         // Check if the item exists in the inventory
//         const itemRecord = await Item.findById(itemObjectId);
//         if (!itemRecord) {
//           console.error(`Item with ID ${item} not found in inventory`);
//           errors.push({
//             row,
//             message: `Item with ID ${item} not found in inventory`,
//           });
//           return;
//         }

//         // Update the stock of the item
//         itemRecord.stock += quantityInt;
//         await itemRecord.save();

//         // Prepare results
//         const creditNote = {
//           creditNoteID: `CN-${Date.now()}`,
//           invoiceID: invoiceObjectId,
//           userId,
//           invoiceDetails: {
//             items: [
//               {
//                 item: itemObjectId,
//                 quantity: quantityInt,
//                 price: priceFloat,
//                 tax: taxFloat,
//                 total: totalFloat,
//               },
//             ],
//           },
//         };

//         console.log("Adding credit note:", creditNote);  // Log the credit note being added
//         results.push(creditNote);
//       })

//       .on("end", async () => {
//         try {
//           console.log("Finished processing rows.");
//           console.log("Results:", results);
//           console.log("Errors:", errors);
//           console.log("Total results:", results.length);

//           if (results.length === 0) {
//             return res.status(400).json({
//               message: "No valid credit notes to save",
//               errors,
//             });
//           }

//           // Log to verify that insertMany is being called
//           console.log("Inserting credit notes into the database...");

//           const savedCreditNotes = await CreditNote.insertMany(results, { session });

//           console.log("Credit notes saved:", savedCreditNotes);

//           await session.commitTransaction();

//           res.status(201).json({
//             message: "Credit notes imported successfully",
//             results: savedCreditNotes,
//           });
//         } catch (error) {
//           console.error("Error saving credit notes:", error);
//           await session.abortTransaction();
//           return res.status(500).json({
//             message: "Error saving credit notes",
//             error: error.message,
//           });
//         } finally {
//           session.endSession();
//         }
//       })
//       .on("error", async (error) => {
//         console.error("Error reading CSV file:", error);
//         await session.abortTransaction();
//         return res.status(500).json({
//           error: "Failed to read CSV file",
//           message: error.message,
//         });
//       });
//   } catch (error) {
//     console.error("Error importing credit notes:", error);
//     await session.abortTransaction();
//     return res.status(500).json({
//       message: "Error importing credit notes",
//       error: error.message,
//     });
//   } finally {
//     session.endSession();
//   }
// };


const importCreditNotesFromCSV = async (req, res) => {
  if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
  }

  const session = await mongoose.startSession(); 
  session.startTransaction();

  try {
      const userId = req.business.userId;
      if (!userId) {
          return res.status(400).json({ message: "User ID is required" });
      }

      const results = [];
      const errors = [];
      const stream = Readable.from(req.file.buffer.toString("utf-8"));

      await new Promise((resolve, reject) => {
          stream
              .pipe(csv()) 
              .on("data", async (row) => {

                  const { invoiceID, item, quantity, price, tax, total } = row;

                  if (!invoiceID || !item || !quantity || !price || !tax || !total) {
                      console.warn("Skipping row with missing fields:", row);
                      errors.push({ row, message: `Missing required fields: ${JSON.stringify(row)}` });
                      return;
                  }

                  const quantityInt = parseInt(quantity, 10);
                  const priceFloat = parseFloat(price);
                  const taxFloat = parseFloat(tax);
                  const totalFloat = parseFloat(total);

                  if (
                      isNaN(quantityInt) ||
                      isNaN(priceFloat) ||
                      isNaN(taxFloat) ||
                      isNaN(totalFloat)
                  ) {
                      console.warn("Skipping row with invalid numeric data:", row);
                      errors.push({ row, message: "Invalid numeric data" });
                      return;
                  }

                  const itemObjectId = new mongoose.Types.ObjectId(item);
                  const invoiceObjectId = new mongoose.Types.ObjectId(invoiceID);

                 

                  const invoiceDetails = await Invoice.findById(invoiceObjectId).session(session);
                  if (!invoiceDetails) {
                      console.error(`Invoice with ID ${invoiceID} not found`);
                      errors.push({ row, message: `Invoice with ID ${invoiceID} not found` });
                      return;
                  }

                  const originalItem = invoiceDetails.items.find((invoiceItem) =>
                      invoiceItem.item.equals(itemObjectId)
                  );
                  if (!originalItem) {
                      console.warn(`Item ID ${item} not found in invoice ${invoiceID}`);
                      errors.push({ row, message: `Item ID ${item} not found in invoice ${invoiceID}` });
                      return;
                  }

                  const originalQuantity = originalItem.quantity;

                  if (quantityInt > originalQuantity || quantityInt <= 0) {
                      console.warn(`Invalid return quantity for item ${item}. Must be between 1 and ${originalQuantity}.`);
                      errors.push({
                          row,
                          message: `Invalid return quantity. Must be between 1 and ${originalQuantity}.`,
                      });
                      return;
                  }

                  const itemRecord = await Item.findById(itemObjectId).session(session);
                  if (!itemRecord) {
                      console.error(`Item with ID ${item} not found in inventory`);
                      errors.push({
                          row,
                          message: `Item with ID ${item} not found in inventory`,
                      });
                      return;
                  }

                  itemRecord.stock += quantityInt;
                  await itemRecord.save({ session });

                  const creditNote = {
                      creditNoteID: `CN-${Date.now()}`,
                      invoiceID: invoiceObjectId,
                      userId,
                      invoiceDetails: {
                          items: [
                              {
                                  item: itemObjectId,
                                  quantity: quantityInt,
                                  price: priceFloat,
                                  tax: taxFloat,
                                  total: totalFloat,
                              },
                          ],
                      },
                  };

                  results.push(creditNote);  
              })
              .on("end", resolve) 
              .on("error", reject); 
      });

      if (results.length === 0) {
          return res.status(400).json({
              message: "No valid credit notes to save",
              errors,
          });
      }

     

      const savedCreditNotes = await CreditNote.insertMany(results, { session });


      await session.commitTransaction();
      session.endSession();

      res.status(201).json({
          message: "Credit notes imported successfully",
          results: savedCreditNotes,
      });
  } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error("Error importing credit notes:", error);

      res.status(500).json({
          message: "Failed to import credit notes",
          error: error.message || error,
      });
  }
};




// Create a new Credit Note
// const createCreditNote = async (req, res) => {
//   try {
//     const { invoiceID, returnedItems } = req.body;
//     const userId = req.business.userId;

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found." });
//     }


//     const invoiceDetails = await Invoice.findById(invoiceID);
//     if (!invoiceDetails) {
//       return res.status(404).json({ error: 'Invoice not found' });
//     }

//     const plainInvoiceDetails = invoiceDetails.toObject();

//     const invoiceItemsMap = new Map(
//       plainInvoiceDetails.items.map(item => [item.item.toString(), item.quantity])
//     );

//     for (const { itemID, quantity } of returnedItems) {
//       if (!invoiceItemsMap.has(itemID)) {
//         return res.status(400).json({ error: `Item ID ${itemID} not found in the invoice` });
//       }

//       const originalQuantity = invoiceItemsMap.get(itemID);

//       if (quantity > originalQuantity || quantity <= 0) {
//         return res.status(400).json({
//           error: `Invalid return quantity for item ${itemID}. Must be between 1 and ${originalQuantity}.`,
//         });
//       }

//       const itemRecord = await Item.findById(itemID);
//       if (!itemRecord) {
//         return res.status(404).json({ error: `Item with ID ${itemID} not found in inventory` });
//       }

//       itemRecord.stock += quantity;
//       await itemRecord.save();
//     }

//     const creditNote = new CreditNote({
//       creditNoteID: `CN-${Date.now()}`,
//       invoiceID,
//       userId,
//       invoiceDetails: plainInvoiceDetails,
//     });

//     const savedCreditNote = await creditNote.save();

//     res.status(201).json(savedCreditNote);
//   } catch (error) {
//     console.error('Error creating credit note:', error);
//     res.status(500).json({ error: error.message });
//   }
// };


const createCreditNote = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { invoiceID, returnedItems } = req.body;
    const userId = req.business.userId;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Retrieve invoice details
    const invoiceDetails = await Invoice.findById(invoiceID).session(session);
    if (!invoiceDetails) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    const plainInvoiceDetails = invoiceDetails.toObject();
    const invoiceItemsMap = new Map(
      plainInvoiceDetails.items.map(item => [item.item.toString(), item.quantity])
    );

    // Validate and process returned items
    const updatedItems = []; // To store updated items for credit note creation
    for (const { itemID, quantity } of returnedItems) {
      if (!invoiceItemsMap.has(itemID)) {
        return res.status(400).json({ error: `Item ID ${itemID} not found in the invoice` });
      }

      const originalQuantity = invoiceItemsMap.get(itemID);
      if (quantity > originalQuantity || quantity <= 0) {
        return res.status(400).json({
          error: `Invalid return quantity for item ${itemID}. Must be between 1 and ${originalQuantity}.`,
        });
      }

      // Update item stock and add credit note details
      const itemRecord = await Item.findById(itemID).session(session);
      if (!itemRecord) {
        return res.status(404).json({ error: `Item with ID ${itemID} not found in inventory` });
      }

      // Increase the stock of the returned item
      itemRecord.stock += quantity;

      // Create credit note details
      const itemInvoiceDetails = plainInvoiceDetails.items.find(i => i.item.toString() === itemID);
      const total = (itemInvoiceDetails.price * quantity) + (itemInvoiceDetails.tax * quantity);
      
      const creditNoteItem = {
        item: itemID,
        name: itemInvoiceDetails.name,
        quantity,
        description: itemInvoiceDetails.description,
        price: itemInvoiceDetails.price,
        tax: itemInvoiceDetails.tax,
        total,
      };

      itemRecord.creditNote.push({
        creditNoteId: `CN-${Date.now()}`, // Temporary ID
        date: new Date(),
        invoiceID,
        quantity,
        returnDate: new Date(),
        items: [creditNoteItem],  // Push item details to creditNote.items
      });

      await itemRecord.save({ session });

      updatedItems.push({
        itemID,
        quantity,
        creditNoteItem, // Store item details for credit note
      });
    }

    // Create the credit note and add the returned items
    const creditNote = new CreditNote({
      creditNoteID: `CN-${Date.now()}`, // Use 'creditNoteID' here
      invoiceID,
      userId,
      items: updatedItems,  // Ensure items are pushed correctly here
      invoiceDetails: plainInvoiceDetails,
    });

    const savedCreditNote = await creditNote.save({ session });

    // Update temporary credit note ID in item records
    for (const { itemID } of returnedItems) {
      const itemRecord = await Item.findById(itemID).session(session);
      const creditNoteEntry = itemRecord.creditNote.find(
        cn => cn.creditNoteId.startsWith("CN-")
      );
      if (creditNoteEntry) {
        creditNoteEntry.creditNoteId = savedCreditNote._id;
      }
      await itemRecord.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(savedCreditNote);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error creating credit note:", error);
    res.status(500).json({ error: error.message });
  }
};



// Get a Credit Note by ID
const getCreditNoteById = async (req, res) => {
  try {
    const { id } = req.params;
    const notes = await CreditNote.findById(id);

    if (!notes) {
      return res.status(404).json({ message: 'Credit notes not found' });
    }

    res.status(200).json({
      message: 'notes fetched successfully',
      notes,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: 'Failed to fetch notes',
      error: error.message,
    });
  }
};



// Get all Credit Notes
const getAllCreditNotes = async (req, res) => {
  try {
    const notes = await CreditNote.find();
    res.status(200).json({
      message: 'Credit notes fetched successfully',
      notes,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: 'Failed to fetch notes',
      error: error.message,
    });
  }
};


const deleteCreditNote = async (req, res) => {
  const { id } = req.params;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
      const creditNote = await CreditNote.findById(id).session(session);

      if (!creditNote) {
          return res.status(404).json({ error: 'Credit Note not found' });
      }

      for (const invoiceItem of creditNote.invoiceDetails.items) {
          const { item: itemId } = invoiceItem;

          const itemRecord = await Item.findById(itemId).session(session);

          if (itemRecord) {
              if (Array.isArray(itemRecord.creditNote)) {

                  itemRecord.creditNote = itemRecord.creditNote.filter(
                      history => history.creditNoteId && history.creditNoteId !== id
                  );


                  await itemRecord.save({ session });
              } else {
                  console.log('creditNote is not an array or does not exist.');
              }
          }
      }

      await CreditNote.findByIdAndDelete(id).session(session);

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({ message: 'Credit Note deleted and item history updated successfully' });
  } catch (error) {
      await session.abortTransaction();
      session.endSession();

      console.error('Error deleting credit note:', error);
      res.status(500).json({ error: error.message });
  }
};



module.exports = {
  importCreditNotesFromCSV,
  createCreditNote,
  getCreditNoteById,
  getAllCreditNotes,
  deleteCreditNote
};
