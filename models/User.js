import mongoose from "mongoose";

// Mongoose User model for MongoDB
// -------------------------------
// This file defines the User schema and model for MongoDB using Mongoose.
// It is used to store and manage user data synced from Clerk authentication events.

const userSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartItems: { type: Object, default: {} }
}, { minimize: false })

const User = mongoose.models.user || mongoose.model('user', userSchema)

export default User
