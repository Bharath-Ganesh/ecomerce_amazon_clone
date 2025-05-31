// Inngest event integration for user sync
// --------------------------------------
// This file defines event-driven functions to synchronize user data between Clerk (authentication provider) and MongoDB.
// It uses Inngest to listen for Clerk webhook events (user created, updated, deleted) and updates the database accordingly.
// This enables reliable, automated user data management in response to authentication events.

// Import required dependencies
import { Inngest } from "inngest";

// Create a new Inngest client instance for handling events
// The id parameter identifies this specific application
export const inngest = new Inngest({ id: "ecommerce-next" });

// Import database connection and User model
import connectDB from "./db";
import User from "../models/User";
import Order from "../models/Order";

/**
 * Inngest function to handle new user creation events from Clerk
 * This function syncs newly created users to our MongoDB database
 * 
 * @event user/user.created - Triggered when a new user is created in Clerk
 * @param {Object} event - Contains user data from Clerk
 */
export const syncUserCreation = inngest.createFunction(
    {
        id: "sync-user-from-clerk",
        name: "Sync User from Clerk"
    },
    { event: "user/user.created" },
    async ({ event }) => {
        // Connect to MongoDB database
        await connectDB();

        // Extract user information from the event
        const userData = event.data;

        // Create new User model instance with required fields
        const user = new User({
            _id: userData.id,
            name: userData.name,
            email: userData.email,
            password: userData.password
        });

        // Connect and save the new user to database
        await connectDB();
        // User.create() is a Mongoose model method that creates a new document
        await User.create(userData);
    }
);

/**
 * Inngest function to handle user update events from Clerk
 * Updates existing user records in MongoDB when user data changes in Clerk
 * 
 * @event clerk/user.updated - Triggered when user details are updated in Clerk
 * @param {Object} event - Contains updated user data from Clerk
 */
export const syncUserUpdation = inngest.createFunction(
    {
        id: "update-user-from-clerk",
        name: "Sync User from Clerk"
    },
    { event: "clerk/user.updated" },
    async ({ event }) => {
        // Destructure relevant fields from event data
        const { id, first_name, last_name, email_addresses, image_url } = event.data;

        // Construct updated user data object
        const userData = {
            _id: id,
            email: email_addresses[0].email_address,
            name: first_name + ' ' + last_name,
            imageUrl: image_url
        }

        // Connect and update user record in database
        await connectDB();
        // findByIdAndUpdate is a Mongoose query helper that combines findById and update operations
        await User.findByIdAndUpdate(id, userData);
    }
);

/**
 * Inngest function to handle user deletion events from Clerk
 * Removes user records from MongoDB when users are deleted from Clerk
 * 
 * @event clerk/user.deleted - Triggered when a user is deleted in Clerk
 * @param {Object} event - Contains ID of deleted user
 */
export const syncUserDeletion = inngest.createFunction(
    {
        id: "delete-user-with-clerk",
        name: "Delete User from Clerk"
    },
    { event: "clerk/user.deleted" },
    async ({ event }) => {
        // Extract user ID from event data
        const { id } = event.data;

        // Connect and remove user from database
        await connectDB();

        // findByIdAndDelete is a Mongoose query helper method
        // It's automatically available on Mongoose models and combines findById and remove operations
        await User.findByIdAndDelete(id);
    }
);


/**
 * Inngest function to handle order creation events
 * Creates new orders in MongoDB when triggered
 * 
 * @event order/created - Triggered when a new order is created
 * @param {Object} event - Contains order details including items, amount, address
 */
export const createUserOrder = inngest.createFunction(
    {
        id: "create-user-order",
        name: "Create User Order",
        batchEvents: {
            maxSize: 5,
            timeout: "5s"
        }
    },
    { event: "order/created" },
    async ({ events }) => {
        const orders = events.map((event) => ({
            userId: event.data.userId,
            items: event.data.items,
            amount: event.data.amount,
            address: event.data.address,
            date: Date.now()
        }));

        await connectDB();
        await Order.insertMany(orders);
        return { success: true, processed: orders.length, message: "Orders created successfully" };

    }
);
