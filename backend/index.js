const express = require("express");
var nodemailer = require("nodemailer");
const cors = require("cors");
require("./config");
const User = require("./Userr");
const Product = require("./Products");
const Image = require("./Image");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const router = express.Router();
const FollowRequest = require("./FollowRequest"); // Adjust the path based on your folder structure
const Messagebox = require('./Messagebox')
const mongoose = require('mongoose');  // Import mongoose


require("dotenv").config();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

const app = express();


// Increase the size limit (e.g., 10MB)
app.use(express.json({ limit: '10mb' }));  // For JSON payloads
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads"); // Directory to store uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Unique file name
  },
});
const upload = multer({ storage });

const path = require("path");

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000", // Correct URL for your frontend
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // Allow all common HTTP methods
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  })
);

app.get("/", (req, res) => {
  res.json("hello");
});

// app.post("/register", async (req, resp) => {
//   try {
//       const { name, email, password } = req.body;

//       // Check if email already exists
//       const existingUser = await User.findOne({ email });
//       if (existingUser) {
//           return resp.status(400).send({ error: "Email already exists" });
//       }

//       // Hash the password
//       const salt = await bcrypt.genSalt(10);
//       const hashedPassword = await bcrypt.hash(password, salt);

//       // Save the user with the hashed password
//       let user = new User({ name, email, password: hashedPassword });
//       let result = await user.save();

//       result = result.toObject();
//       delete result.password; // Remove the password from the response

//       // Generate JWT
//       jwt.sign({ result },JWT_SECRET, { expiresIn: "4h" }, (err, token) => {
//           if (err) {
//               return resp.status(500).send("Something went wrong!");
//           }
//           resp.send({ result, auth: token });
//       });
//   } catch (error) {
//       resp.status(500).send("Error occurred while registering user");
//   }
// });

app.post("/register", async (req, resp) => {
  try {
    const { name, email, password } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return resp.status(400).send({ error: "Email already exists" });
    }

    // Check if username already exists
    const existingName = await User.findOne({ name });
    if (existingName) {
      return resp.status(400).send({ errorname: "Username already exists!" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Initialize followers and following to empty arrays explicitly
    const user = new User({
      name,
      email,
      password: hashedPassword,
      following: [],  // Explicitly initialize as an empty array
      followers: []   // Explicitly initialize as an empty array
    });

    // Save the user with the hashed password
    let result = await user.save();

    result = result.toObject();
    delete result.password; // Remove the password from the response

    // Generate JWT token
    jwt.sign({ result }, JWT_SECRET, { expiresIn: "4h" }, (err, token) => {
      if (err) {
        return resp.status(500).send("Something went wrong!");
      }
      resp.send({ result, auth: token });
    });
  } catch (error) {
    // Handle unique constraint errors like duplicate key errors
    if (error.code === 11000) {
      return resp.status(400).json({ error: "Duplicate key error", details: error.message });
    }
    resp.status(500).json({ error: "Error occurred while registering user", details: error.message });
  }
});


app.post("/login", async (req, resp) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      return resp.status(404).json({ error: "User not found" }); // Return JSON response
    }

    // Compare the entered password with the hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return resp.status(401).json({ error: "Invalid credentials" }); // Return JSON response
    }

    // Remove password from user object
    user = user.toObject();
    delete user.password;

    // Generate JWT
    jwt.sign({ user }, JWT_SECRET, (err, token) => {
      if (err) {
        return resp.status(500).json({ error: "Something went wrong!" }); // Return JSON response
      }
      resp.json({ user, auth: token }); // Success response in JSON
    });
  } catch (error) {
    console.error("Login Error:", error); // Log the error for debugging
    resp.status(500).json({ error: "An error occurred while logging in" }); // Return JSON response
  }
});

app.post("/forgot-password", async (req, resp) => {
  const { email } = req.body;

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    return resp.status(404).send("User not found");
  }

  // Generate a reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenHash = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Save the reset token hash and expiry time
  user.resetToken = resetTokenHash;
  user.resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes expiry time

  try {
    await user.save();

    // Send reset link to the user via email
    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
    const message = `You requested a password reset. Please visit the following link to reset your password: ${resetUrl}`;

    try {
      await transporter.sendMail({
        to: user.email,
        subject: "Password Reset",
        text: message,
      });
      resp.send("Reset link sent to your email");
    } catch (error) {
      // In case of an error while sending the email, clear the reset token
      console.error("Error sending email:", error);
      user.resetToken = undefined;
      user.resetTokenExpiry = undefined;
      await user.save();
      resp.status(500).send("Error sending email");
    }
  } catch (error) {
    console.error("Error saving user:", error);
    resp.status(500).send("Error saving reset token");
  }
});

app.post("/reset-password/:token", async (req, resp) => {
  const { token } = req.params; // Token from URL parameter
  const { password } = req.body; // Password from the request body

  // Hash the received token to match with the stored hashed token
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  // Find the user by matching the hashed token and ensuring it's not expired
  const user = await User.findOne({
    resetToken: tokenHash,
    resetTokenExpiry: { $gt: Date.now() }, // Ensure token hasn't expired
  });

  if (!user) {
    console.log("No user found or token expired");
    return resp.status(400).json({ message: "Invalid or expired token" }); // Send JSON response on failure
  }

  // Hash the new password before saving it
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);

  // Clear the reset token and expiration time after password reset
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();

  resp.json({ message: "Password reset successful" }); // Send JSON response on success
});

app.post(
  "/add-product",
  verifytoken,
  upload.single("image"),
  async (req, res) => {
    try {
      const { message, Caption, userid, name, time } = req.body;

      // Create and save the product
      const product = new Product({
        message,
        Caption,
        userid,
        name,
        time,
      });
      await product.save();

      res.status(201).json({ message: "Product added successfully", product });
    } catch (error) {
      res.status(500).json({ message: "Error adding product", error });
    }
  }
);

app.get("/products/:userid", verifytoken, async (req, resp) => {
  const { userid } = req.params; // Extract userid from request parameters

  try {
    // Use the where condition to find products by userid
    let products = await Product.find({ userid: userid }); // Query by userid field

    if (products.length > 0) {
      resp.send(products);
    } else {
      resp.send({ result: "No products found for this user" });
    }
  } catch (error) {
    // Handle errors
    resp
      .status(500)
      .send({ error: "An error occurred while fetching products" });
  }
});

app.get("/home", verifytoken, async (req, resp) => {
  try {
    let products = await Product.find({});

    if (products.length > 0) {
      resp.send(products);
    } else {
      resp.send({ result: "No products found for this user" });
    }
  } catch (error) {
    resp
      .status(500)
      .send({ error: "An error occurred while fetching products" });
  }
});

const fs = require("fs").promises;

app.delete("/product/:id", verifytoken, async (req, resp) => {
  try {
    // Find the product by ID
    const product = await Product.findById(req.params.id);

    if (!product) {
      return resp.status(404).send({ message: "Product not found" });
    }

    // Delete the product from the database
    const result = await Product.deleteOne({ _id: req.params.id });
    resp.status(200).send({ message: "Product deleted successfully", result });
  } catch (error) {
    console.error("Error deleting product:", error);
    resp.status(500).send({ message: "Error deleting product", error });
  }
});

app.get("/product/:id", verifytoken, async (req, resp) => {
  let result = await Product.findById({ _id: req.params.id });
  if (result) {
    resp.send(result);
  } else {
    resp.send({ result: "no result found" });
  }
});
app.put(
  "/product/:id",
  verifytoken,
  upload.single("image"),
  async (req, resp) => {
    try {
      const { message, Caption } = req.body;

      if (!message) {
        return resp.status(400).send({ message: "Message is required" });
      }

      const updatedData = { message };
      if (Caption) {
        updatedData.Caption = Caption; // Only include if provided
      }

      const result = await Product.updateOne(
        { _id: req.params.id },
        { $set: updatedData }
      );
      resp
        .status(200)
        .send({ message: "Product updated successfully", result });
    } catch (error) {
      console.error("Error updating product:", error);
      resp.status(500).send({ message: "Error updating product", error });
    }
  }
);

app.get("/search/:key", verifytoken, async (req, resp) => {
  let result = await Product.find({
    $or: [
      { message: { $regex: req.params.key } },
      { name: { $regex: req.params.key } },
      // { category: { $regex: req.params.key } },
      // { price: { $regex: req.params.key } },
    ],
  });
  resp.send(result);
});

function verifytoken(req, resp, next) {
  let token = req.headers["authorization"];
  if (token) {
    token = token.split(" ")[1];
    jwt.verify(token, JWT_SECRET, (err, vaild) => {
      if (err) {
        resp.status(401).send({ result: "please provide token" });
      } else {
        next();
      }
    });
  } else {
    resp.status(403).send({ result: "please add token with header" });
  }
}


// function verifytoken(req, resp, next) {
//   const authHeader = req.headers["authorization"]; // Extract the Authorization header

//   if (!authHeader) {
//     return resp.status(403).send({ result: "Token is missing. Please add token to the header." });
//   }

//   const token = authHeader.split(" ")[1]; // Extract the token part
//   if (!token) {
//     return resp.status(403).send({ result: "Malformed token. Please provide a valid token." });
//   }

//   jwt.verify(token, JWT_SECRET, (err, decoded) => {
//     if (err) {
//       return resp.status(401).send({ result: "Invalid or expired token. Please login again." });
//     }

//     req.user = decoded; // Attach the decoded token payload (e.g., user ID) to the request
//     next(); // Proceed to the next middleware or route handler
//   });
// }

app.put(
  "/profile/:id",
  verifytoken,
  upload.single("profileImage"),
  async (req, resp) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return resp.status(404).send({ message: "User not found" });
      }

      let updatedData = {};
      if (req.file) {
        const newImagePath = `uploads/${req.file.filename}`;
        updatedData.profileImage = newImagePath;

        if (user.profileImage) {
          const oldImagePath = path.resolve(__dirname, user.profileImage);
          try {
            await fs.unlink(oldImagePath);
            console.log("Old profile image deleted:", user.profileImage);
          } catch (err) {
            console.error("Error deleting old profile image:", err.message);
          }
        }
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        { $set: updatedData },
        { new: true }
      ).select("-password"); // Exclude the password field from the response

      if (!updatedUser) {
        return resp
          .status(500)
          .send({ message: "Failed to update profile image" });
      }

      resp.status(200).send({
        message: "Profile image updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Error updating profile image:", error);
      resp
        .status(500)
        .send({
          message: "Error updating profile image",
          error: error.message,
        });
    }
  }
);

app.put("/message/:id", verifytoken, async (req, res) => {
  try {
    const productId = req.params.id;
    const { userId, message } = req.body;

    if (!message) {
      return res.status(400).send({ message: "Message is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send({ message: "Product not found" });
    }
    const username = await User.findById(userId);
    const name = username.name;
    // Append the new message
    product.messages.push({ userId, message, name });
    await product.save();

    res.status(200).send(product.messages); // Return updated messages
  } catch (err) {
    res.status(500).send({ message: "Error adding message", error: err });
  }
});

app.get("/message/:id", verifytoken, async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).send({ message: "Product not found" });
    }

    res.status(200).send(product.messages);
  } catch (err) {
    res.status(500).send({ message: "Error fetching messages", error: err });
  }
});

// Delete a message from a product's message array
app.delete("/message/:productId/:messageId", verifytoken, async (req, res) => {
  const { productId, messageId } = req.params;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Filter out the message with the given ID
    product.messages = product.messages.filter(
      (msg) => msg._id.toString() !== messageId
    );

    await product.save();
    res.json(product.messages); // Return updated messages
  } catch (err) {
    console.error("Error deleting message:", err);
    res.status(500).json({ error: "Failed to delete message" });
  }
});

// Edit a message in a product's message array
app.patch("/message/:productId/:messageId", verifytoken, async (req, res) => {
  const { productId, messageId } = req.params;
  const { message } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const messageIndex = product.messages.findIndex(
      (msg) => msg._id.toString() === messageId
    );

    if (messageIndex === -1) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Update the message
    product.messages[messageIndex].message = message;

    await product.save();
    res.json(product.messages); // Return updated messages
  } catch (err) {
    console.error("Error editing message:", err);
    res.status(500).json({ error: "Failed to edit message" });
  }
});

// Example Express route for fetching user details
app.get("/user/:userId", verifytoken, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId); // Fetch user from DB
    if (!user) return res.status(404).send("User not found");

    res.json(user); // Send back user details
  } catch (err) {
    res.status(500).send("Server error");
  }
});

app.put("/like-product/:id", verifytoken, async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.body.userId; // User ID passed in the request body

    // Retrieve the username from the User model based on userId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    const username = user.name; // Get the username

    // Find the product by productId
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send({ message: "Product not found" });
    }

    let isLiked = false;
    if (product.likedBy.includes(username)) {
      // If the user already liked the product, remove the like (dislike)
      product.likes -= 1;
      product.likedBy = product.likedBy.filter((name) => name !== username);
      isLiked = false;
    } else {
      // If the user hasn't liked the product, add the like
      product.likes += 1;
      product.likedBy.push(username);
      isLiked = true;
    }

    // Save the product with the updated like count and likedBy list
    await product.save();

    // Respond with the updated like count and likedBy list
    res.status(200).send({
      likes: product.likes,
      likedBy: product.likedBy,
      isLiked, // Indicate if the user liked the product
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Error updating like count", error: err });
  }
});

app.get("/liked/:id", verifytoken, async (req, resp) => {
  let result = await User.findOne({ _id: req.params.id });
  if (result) {
    resp.send(result);
  } else {
    resp.send({ result: "no result found" });
  }
});

const bodyParser = require("body-parser");
const { constrainedMemory } = require("process");
app.use(bodyParser.json({ limit: "10mb" }));

// Base64 Image Upload Route
app.post("/upload", verifytoken, async (req, res) => {
  try {
    const { data, Id } = req.body; // Ensure this matches the frontend
    

    if (!data || !Id) {
      return res
        .status(400)
        .json({ message: "Base64 data and Id are required." });
    }

    const existingImage = await User.findOne({ _id: Id });

    if (existingImage) {
      existingImage.data = data;
      await existingImage.save();
      return res.status(200).json({ message: "Image updated successfully." });
    } else {
      const newImage = new User({ _id: Id, data });
      await newImage.save();
      return res.status(201).json({ message: "Image uploaded successfully." });
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});


// Fetch All Images for a Specific User
app.get("/images/:userId",verifytoken, async (req, res) => {
  try {
    const { userId } = req.params; // Get email from query params

    // Fetch images associated with the given email
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Return the images in the response
    res.status(200).json({ data: user.data });
  } catch (error) {
    
    res.status(500).json({ message: "Internal server error." });
  }
});





const Notification = require('./Notification')

app.post('/follow',verifytoken, async (req, res) => {
  try {
    const { fromUserId, toUserId } = req.body;

    if (!fromUserId || !toUserId) {
      return res.status(400).json({ message: "Both fromUserId and toUserId are required" });
    }

    // Find the users in the database
    const fromUser = await User.findById(fromUserId);
    const toUser = await User.findById(toUserId);

    if (!fromUser || !toUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the follow request already exists
    const existingRequest = await FollowRequest.findOne({
      from: fromUserId,
      to: toUserId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ message: "Follow request already sent" });
    }

    // Create the follow request
    const newFollowRequest = new FollowRequest({
      from: fromUserId,
      to: toUserId,
      status: 'pending'
    });

    await newFollowRequest.save();

    // Create a notification for the target user, including followRequestId
    const notification = new Notification({
      from:fromUserId,
      user: toUserId, // 'user' should be the target user of the follow request
      message: `${fromUser.name} sent you a follow request`, // Using 'name' of the 'from' user
      followRequestId: newFollowRequest._id, // Include the followRequestId here
      data:`${fromUser.data}`
    });

    await notification.save();

    // Respond with a success message
    res.status(200).json({ message: 'Follow request sent and notification created' });

  } catch (err) {
    console.error("Error processing request:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});




app.get('/notifications/:userId',verifytoken, async (req, res) => {
  try {
      const { userId } = req.params; // Get userId from the URL
      if (!userId) {
          return res.status(400).json({ message: "User ID is required" });
      }
      // Fetch notifications for the specified user
      const notifications = await Notification.find({ user: userId });

      res.status(200).json(notifications);
  } catch (err) {
      console.error("Error fetching notifications:", err);
      res.status(500).json({ message: "Server error", error: err.message });
  }
});



app.post('/notifications/accept-follow',verifytoken, async (req, res) => {
  try {
    const { notificationId, followRequestId } = req.body;
    
    // Validate the incoming IDs
    if (!mongoose.Types.ObjectId.isValid(notificationId) || !mongoose.Types.ObjectId.isValid(followRequestId)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    // Fetch the notification and follow request
    const notification = await Notification.findById(notificationId);
    const followRequest = await FollowRequest.findById(followRequestId);

    if (!notification || !followRequest) {
      return res.status(404).json({ message: 'Notification or Follow Request not found' });
    }

    // Ensure the notification corresponds to the follow request
    if (notification.followRequestId.toString() !== followRequestId) {
      return res.status(400).json({ message: 'Notification and Follow Request do not match' });
    }

    // Update the follow request status
    await FollowRequest.findOneAndUpdate(
      { status: 'pending' },
      { status: 'accepted' }
    );
    
    await followRequest.save();

    await User.findByIdAndUpdate(followRequest.from, { $push: { following: followRequest.to} });
    await User.findByIdAndUpdate(followRequest.to, { $push: { followers: followRequest.from} });


    // Optionally, mark the notification as read or delete it
    await Notification.findByIdAndDelete(notificationId);

    res.status(200).json({ message: 'Follow request accepted successfully' });
  } catch (err) {
    console.error('Error accepting follow request:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});



app.post('/notifications/reject-follow',verifytoken, async (req, res) => {
  try {
    const { notificationId, followRequestId } = req.body;

    // Delete the follow request
    await FollowRequest.findByIdAndDelete(followRequestId);

    // Delete the related notification
    await Notification.findByIdAndDelete(notificationId);

    res.status(200).json({ message: 'Follow request rejected successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});



// Get follow requests (for the logged-in user)
app.get('/follow-requests/:userId',verifytoken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find follow requests where `to` is the `userId` and populate the `from` field with 'name'
    const requests = await FollowRequest.find({ to: userId })
      .populate('from', 'name')  // Populate `from` field with `name` of the User
      .exec();  // Ensure the query is executed properly
    // Log the entire requests to see the populated data

    // If you want to log just the `name` of the `from` user:
    requests.forEach(request => {
      console.log(request.from.name);  // Logs the 'name' of the user who sent the follow request
    });

    // Send the response with populated data
    res.status(200).json(requests);
  } catch (err) {
    console.error(err);  // Log the error for debugging
    res.status(500).json({ message: 'Server error', error: err });
  }
});

app.post('/unfollow', async (req, res) => {
  try {
    const { userId, targetUserId } = req.body; // userId = who is unfollowing, targetUserId = who they want to unfollow

    if (!userId || !targetUserId) {
      return res.status(400).json({ message: 'Both userId and targetUserId are required' });
    }

    // Step 1: Verify that the user exists
    const user = await User.findById(userId);
    const targetUser = await User.findById(targetUserId);

    if (!user || !targetUser) {
      return res.status(404).json({ message: 'One or both users not found' });
    }

    // Step 2: Check if the user is following the target user
    if (!user.following.includes(targetUserId)) {
      return res.status(400).json({ message: 'You are not following this user' });
    }

    // Step 3: Remove the target user from the `following` list of the user
    await User.findByIdAndUpdate(userId, {
      $pull: { following: targetUserId }
    });

    // Step 4: Remove the user from the `followers` list of the target user
    await User.findByIdAndUpdate(targetUserId, {
      $pull: { followers: userId }
    });

    // Step 5: Delete any follow request between the users (both directions)
    await FollowRequest.deleteMany({
      $or: [
        { from: userId, to: targetUserId },
        // { from: targetUserId, to: userId }
      ],
      status: { $in: ['pending', 'accepted'] }
    });

    // Step 6: Delete any notifications related to the follow action
    await Notification.deleteMany({
      $or: [
        { user: userId, from: targetUserId },
        { user: targetUserId, from: userId }
      ]
    });

    // Step 7: Send success response
    res.status(200).json({ message: 'Successfully unfollowed the user and deleted related follow requests and notifications' });

  } catch (err) {
    console.error("Error during unfollow operation:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


app.get('/follow-status/:fromUserId/:toUserId',verifytoken, async (req, res) => {
  try {
    const { fromUserId, toUserId } = req.params; // Get user IDs from params

    // Check if the follow request exists
    const followRequest = await FollowRequest.findOne({
      from: fromUserId,
      to: toUserId,
    });

    if (followRequest) {
      if (followRequest.status === 'pending') {
        return res.status(200).json({ status: 'Requested' }); // Follow request is still pending
      } else if (followRequest.status === 'accepted') {
        return res.status(200).json({ status: 'Following' }); // Follow request was accepted
      }
    }

    return res.status(200).json({ status: 'Follow' }); // Default if no follow request exists
  } catch (err) {
    console.error("Error fetching follow status:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


app.post('/message-request', verifytoken, async (req, res) => {
  try {
    const { fromUserId, toUserId } = req.body;

    if (!fromUserId || !toUserId) {
      return res.status(400).json({ message: "Both fromUserId and toUserId are required" });
    }

    // Find the users in the database
    const fromUser = await User.findById(fromUserId);
    const toUser = await User.findById(toUserId);

    if (!fromUser || !toUser) {
      return res.status(404).json({ message: "One or both users not found" });
    }

    // Check if a conversation already exists
    const existingConversation = await Messagebox.findOne({
      $or: [
        { from: fromUserId, to: toUserId },
        { from: toUserId, to: fromUserId },
      ],
    });

    if (existingConversation) {
      return res.status(200).json({
        message: "Conversation already exists",
        messages: existingConversation.messages || [], // Assuming `messages` field contains the conversation messages
      });
    }

    // Create a new message box if no conversation exists
    const newMessageRequest = new Messagebox({
      from: fromUserId,
      to: toUserId,
      messages: [], // Initialize with an empty messages array
    });

    await newMessageRequest.save();

    return res.status(201).json({
      message: "Message request created successfully",
      messageBox: newMessageRequest,
    });
  } catch (err) {
    console.error("Error processing request:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});



app.put("/message-box/:id", verifytoken, async (req, res) => {
  try {
    const otherID = req.params.id;
    const { userId, message } = req.body;

    if (!mongoose.Types.ObjectId.isValid(otherID)) {
      return res.status(400).send({ message: "Invalid conversation ID" });
    }

    if (!message) {
      return res.status(400).send({ message: "Message is required" });
    }

    // Find the conversation by ID or user pairing
    const product = await Messagebox.findOne({
      $or: [
        { _id: otherID },
        { from: otherID, to: userId },
        { from: userId, to: otherID }
      ]
    });

    if (!product) {
      return res.status(404).send({ message: `Conversation with ID ${otherID} not found` });
    }

    // Append the new message
    const username = await User.findById(userId);
    const name = username ? username.name : "Unknown";
    product.messages.push({ userId, message, name });
    await product.save();

    res.status(200).send(product.messages); // Return updated messages
  } catch (err) {
    console.error("Error adding message:", err);
    res.status(500).send({ message: "Error adding message", error: err.message });
  }
});


app.delete("/message-box/:productId/:messageId",verifytoken, async (req, res) => {
  const { productId, messageId } = req.params;

  try {
    // Find the message box where `to` or `from` matches the provided productId
    const product = await Messagebox.findOne({
      $or: [{ to: productId }, { from: productId }],
    });

    if (!product) {
      console.error(`Message box with 'to' or 'from' ID ${productId} not found`);
      return res.status(404).json({ error: "Message box not found" });
    }

    // Filter out the message with the given ID
    product.messages = product.messages.filter(
      (msg) => msg._id.toString() !== messageId
    );

    // Save the updated document
    await product.save();

    // Respond with the updated messages
    res.json(product.messages);
  } catch (err) {
    console.error("Error deleting message:", err);
    res.status(500).json({ error: "Failed to delete message" });
  }
});




// // Edit a message in a product's message array
// app.patch("/message-box/:productId/:messageId", verifytoken, async (req, res) => {
//   const { productId, messageId } = req.params;
//   const { message } = req.body;

//   try {
//     const product = await Product.findById(productId);
//     if (!product) {
//       return res.status(404).json({ error: "Product not found" });
//     }

//     const messageIndex = product.messages.findIndex(
//       (msg) => msg._id.toString() === messageId
//     );

//     if (messageIndex === -1) {
//       return res.status(404).json({ error: "Message not found" });
//     }

//     // Update the message
//     product.messages[messageIndex].message = message;

//     await product.save();
//     res.json(product.messages); // Return updated messages
//   } catch (err) {
//     console.error("Error editing message:", err);
//     res.status(500).json({ error: "Failed to edit message" });
//   }
// });



app.get('/notify-image/:userId',verifytoken, async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId)// Select only the profileImage field
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ data: user.data });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get("/getfollow/:userId", verifytoken, async (req, res) => {
  const { userId } = req.params; // Get userId from the route parameters

  try {
    // Find the user by their ID in the User schema
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get the number of followers from the user schema
    const followersCount = user.followers.length;

    // Get the number of following from the user schema
    const followingCount = user.following.length;
    
    // Send the counts as a response
    res.status(200).json({ followersCount, followingCount });
  } catch (err) {
    console.error("Error fetching follow stats:", err);
    res.status(500).json({ message: "Error fetching follow stats." });
  }
});


app.get("/getotherfollows/:userId", verifytoken, async (req, res) => {
  const { userId } = req.params;
 
  // Check if userId is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid userId format." });
  }

  try {
    const user = await User.findById(userId); // Find the user by ID
    
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const followersCount = user.followers.length;
    const followingCount = user.following.length;

    res.status(200).json({ followersCount, followingCount });
  } catch (err) {
    console.error("Error fetching follow counts:", err);
    res.status(500).json({ message: "Error fetching follow counts." });
  }
});



app.get("/usernames", verifytoken, async (req, resp) => {
  try {
    let users = await User.find({});
    if (!users) {
      return resp.status(404).send({ result: "Users not found" });
    }
    if (users.length > 0) {
      resp.send(users);
    } else {
      resp.send({ result: "No products found for this user" });
    }
  } catch (error) {
    resp
      .status(500)
      .send({ error: "An error occurred while fetching products" });
  }
});





app.get("/searchuser/:key", verifytoken, async (req, resp) => {
  let result = await User.find({
    $or: [
      // { message: { $regex: req.params.key } },
      { name: { $regex: req.params.key } },
      // { category: { $regex: req.params.key } },
      // { price: { $regex: req.params.key } },
    ],
  });
  resp.send(result);
});



app.get("/myfollowers/:userId", verifytoken, async (req, resp) => {
  try {
    // Extract the userId from the URL parameters
    const userId = req.params.userId;

    // Validate the userId as a MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return resp.status(400).send({ error: "Invalid user ID" });
    }

    // Fetch the user document and populate the followers and following fields with full data
    const user = await User.findById(userId)
      .populate("followers")  // Populate full follower data
      .populate("following"); // Populate full following data

    if (!user) {
      return resp.status(404).send({ error: "User not found" });
    }

    // Extract followers and following arrays
    const { followers, following } = user;

    // Return the full user data in the response
    resp.send({
      followers,
      following,
    });
  } catch (error) {
    // Handle errors and provide meaningful messages
    console.error("Error fetching followers:", error);
    resp.status(500).send({ error: "An error occurred while fetching followers" });
  }
});

app.get("/personalchat/:userId/:key", verifytoken, async (req, resp) => {
  try {
    // Extract the userId and searchKey from the URL parameters
    const { userId, key: searchKey } = req.params;

    // Validate the userId as a MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return resp.status(400).send({ error: "Invalid user ID" });
    }

    // Find the user by userId to access the followers and following IDs
    const user = await User.findById(userId);

    if (!user) {
      return resp.status(404).send({ error: "User not found" });
    }

    // Fetch the followers and following user data by their IDs
    const followerIds = user.followers;
    const followingIds = user.following;

    // Query to find users by their IDs
    const followers = await User.find({ '_id': { $in: followerIds } });
    const following = await User.find({ '_id': { $in: followingIds } });

    // Filter followers based on the searchKey (case-insensitive search)
    const filteredFollowers = followers.filter(follower =>
      follower.name && follower.name.toLowerCase().includes(searchKey.toLowerCase())
    );

    // Filter following based on the searchKey (case-insensitive search)
    const filteredFollowing = following.filter(following =>
      following.name && following.name.toLowerCase().includes(searchKey.toLowerCase())
    );

    // Return the filtered results for followers and following
    resp.send({
      followers: filteredFollowers,
      following: filteredFollowing
    });

  } catch (error) {
    console.error("Error searching followers and following:", error);
    resp.status(500).send({ error: "An error occurred while searching" });
  }
});


app.get("/search-user/:name", async (req, resp) => {
  try {
    const name = req.params.name;

    // Find the user by name
    const user = await User.findOne({ name });

    if (!user) {
      return resp.status(404).json({ error: "User not found" });
    }

    // Return only the ID
    resp.json({ userId: user._id });
  } catch (error) {
    console.error("Error searching user:", error);
    resp.status(500).json({ error: "An error occurred while searching for the user" });
  }
});



app.get("/getfollowers/:userId", verifytoken, async (req, resp) => {
  try {
    // Extract the userId from the URL parameters
    const userId = req.params.userId;

    // Validate the userId as a MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return resp.status(400).send({ error: "Invalid user ID" });
    }

    // Fetch the user document and populate the followers and following fields with full data
    const user = await User.findById(userId)
      .populate("followers")  // Populate full follower data
      .populate("following"); // Populate full following data

    if (!user) {
      return resp.status(404).send({ error: "User not found" });
    }

    // Extract followers and following arrays
    const { followers, following } = user;

    // Return the full user data in the response
    resp.send({
      followers,
      following,
    });
  } catch (error) {
    // Handle errors and provide meaningful messages
    console.error("Error fetching followers:", error);
    resp.status(500).send({ error: "An error occurred while fetching followers" });
  }
});






// API to check if IDs are mutual followers/following for a given user
app.post("/check-mutual", async (req, res) => {
  try {
    const { userId, ids } = req.body; // userId and the list of IDs to check

    if (!userId || !Array.isArray(ids)) {
      return res
        .status(400)
        .json({ message: "User ID and IDs array are required." });
    }

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Extract followers and following IDs from the user document
    const userFollowers = user.followers.map((follower) => follower._id.toString());
    const userFollowing = user.following.map((following) => following._id.toString());

    // Check which IDs are mutual
    const mutualFollowers = ids.filter((id) => userFollowers.includes(id));
    const mutualFollowing = ids.filter((id) => userFollowing.includes(id));

    res.status(200).json({
      message: "Mutual IDs checked successfully.",
      mutualFollowers,
      mutualFollowing,
    });
    
  } catch (error) {
    console.error("Error checking mutual IDs:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});


app.post('/post/:userId', verifytoken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { imageData,username,Caption } = req.body; // Assuming image is sent as a base64 string in the request body

    // Validate that imageData exists
    if (!imageData) {
      return res.status(400).json({ message: 'Image data is required.' });
    }

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if the user already has an image entry
    let userImages = await Image.findOne({ userId });

    // If the user doesn't have any images yet, create a new entry for them
    if (!userImages) {
      userImages = new Image({
        userId,
        images: [{ data: imageData,username:username,userid:userId,caption:Caption}],
        
      });
    } else {
      // If user already has images, add the new image to the array
      userImages.images.push({ data: imageData ,username:username,userid:userId,caption:Caption});
    }

    // Save the updated Image document
    await userImages.save();

    // Send response
    res.status(200).json({ message: 'Image uploaded successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Route to get images for a user
app.get("/getposts/:userId", verifytoken, async (req, res) => {
  try {
    const { userId } = req.params; // Get userId from URL params

    // Find the user's images using their userId
    const userImages = await Image.findOne({ userId });

    // If no images are found, return 404
    if (!userImages) {
      return res.status(404).json({ message: 'No images found for this user.' });
    }

    // Return the images in the response
    res.status(200).json({ images: userImages.images });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
});

app.get("/getposts", verifytoken, async (req, res) => {
  try {
    // Fetch the limit from query parameters, defaulting to 10
    const limit = parseInt(req.query.limit, 10) || 10;

    // Fetch all image documents
    const allImages = await Image.find();

    if (!allImages || allImages.length === 0) {
      return res.status(404).json({ message: 'No images found.' });
    }

    // Flatten all image arrays from each user document into one array
    const images = allImages.reduce((acc, item) => {
      acc.push(...item.images);
      return acc;
    }, []);

    // Shuffle the images array
    const shuffledImages = images.sort(() => Math.random() - 0.5);

    // Limit the number of posts returned 
    const limitedImages = shuffledImages.slice(0, limit);

    // Return the randomized and limited array of images
    res.status(200).json(limitedImages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
});



app.put("/like-post/:id", verifytoken, async (req, res) => {
  try {
    const productId = req.params.id;  // Product ID from URL
    const userId = req.body.userId;   // User ID from bodys

    // Retrieve the user based on userId
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    const username = user.name; // Get the username

    // If productId is a MongoDB ObjectId, query using the _id field of images
    const imageDoc = await Image.findOne({
      'images._id': new mongoose.Types.ObjectId(productId), // Correct usage of ObjectId constructor
    });

    if (!imageDoc) {
      return res.status(404).send({ message: "Image document not found" });
    }

    // Find the specific image object inside the 'images' array
    const image = imageDoc.images.find(img => img._id.toString() === productId);
    

    if (!image) {
      return res.status(404).send({ message: "Image not found in array" });
    }

    let isLiked = false;
    
    if (image.likedBy.includes(username)) {
      image.likes -= 1;
      image.likedBy = image.likedBy.filter(name => name !== username);
      isLiked = false;
    } else {
      image.likes += 1;
      image.likedBy.push(username);
      isLiked = true;
    }

    // Save the updated image document
    await imageDoc.save();

    res.status(200).send({
      likes: image.likes,
      likedBy: image.likedBy,
      isLiked,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Error updating like count", error: err });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
