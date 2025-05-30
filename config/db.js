// This file manages MongoDB connection pooling and exports a reusable connectDB function for database access across the app.
// Import mongoose, the MongoDB object modeling tool designed to work in an asynchronous environment
import mongoose from "mongoose";

// Initialize a cached variable by checking if mongoose is already stored globally
// This helps prevent multiple connections to the database
let cached = global.mongoose;

// If no cached connection exists, initialize the cache object with null values
// This structure will store both the connection (conn) and the connection promise
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null }
};

// Define an async function to handle database connections
// This function implements connection pooling to reuse existing connections
async function connectDB() {
    // If there's an active connection in the cache, return it immediately
    // This prevents creating unnecessary new connections
    if (cached.conn) {
        return cached.conn;
    }

    // If no connection promise exists, create a new connection
    // This ensures we don't try to establish multiple connections simultaneously
    if (!cached.promise) {
        // Configure MongoDB connection options
        // bufferCommands: false tells Mongoose to error out when trying to create records
        // while disconnected, instead of buffering them
        const opts = {
            bufferCommands: false,
        };

        // Create a new connection promise using environment variables
        // MONGODB_URI contains the connection string (e.g., mongodb://localhost:27017)
        // MONGODB_DB specifies the database name
        cached.promise = mongoose.connect(`${process.env.MONGODB_URI}/${process.env.MONGODB_DB}`, opts).then((mongoose) => {
            return mongoose;
        })
    };

    // Wait for the connection promise to resolve and store the connection
    // This ensures we have an active connection before proceeding
    cached.conn = await cached.promise;
    return cached.conn;
}

// Export the connectDB function to be used as the default export
// This allows other parts of the application to import and use this connection handler
export default connectDB;
