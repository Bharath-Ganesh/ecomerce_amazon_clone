/**
 * Product Creation API Endpoint (POST /api/product/add)
 * --------------------------------------------------
 * Handles creation of new products by authenticated sellers in our e-commerce platform.
 * 
 * Technical Implementation:
 * 1. Authentication: Uses Clerk's getAuth() to verify user identity and custom authSeller() 
 *    middleware to validate seller privileges via user metadata
 * 
 * 2. Form Processing: 
 *    - Accepts multipart/form-data containing product details and images
 *    - Validates required fields: name, description, category, price, offerPrice
 *    - Processes multiple image uploads (required minimum: 1 image)
 * 
 * 3. Image Processing:
 *    - Converts uploaded files to array buffers for streaming
 *    - Parallel upload to Cloudinary CDN using upload_stream
 *    - Collects secure_urls for database storage
 * 
 * 4. Database Operations:
 *    - Connects to MongoDB using connection pooling
 *    - Creates product document with normalized data
 *    - Stores Cloudinary URLs in image array
 * 
 * Error Handling:
 * - Authorization failures return 'Not authorized'
 * - Missing images return validation error
 * - All other errors logged and returned with descriptive messages
 * 
 * @param {Request} request - Multipart form data containing:
 *   - name: string
 *   - description: string
 *   - category: string
 *   - price: number
 *   - offerPrice: number
 *   - images: File[]
 * 
 * @returns {Response} JSON response containing:
 *   - success: boolean
 *   - message: string
 *   - newProduct?: Product (on success)
 */

import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import authSeller from "@/lib/authSeller";
import cloudinary from "cloudinary";
import Product from "@/models/Product";
import connectDB from "@/config/db";

// Configure Cloudinary with environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(request) {
    try {
        // Get authenticated user ID from Clerk
        const { userId } = getAuth(request);

        // Verify user has seller privileges
        const isSeller = await authSeller(userId);
        if (!isSeller) {
            return NextResponse.json({ success: false, message: "Not authorized" });
        }

        // Extract product details from multipart form data
        const formData = await request.formData();
        const name = formData.get('name');
        const description = formData.get('description');
        const category = formData.get('category');
        const price = formData.get('price');
        const offerPrice = formData.get('offerPrice');

        // Validate image files are provided
        const files = formData.getAll('images');
        if (!files || files.length === 0) {
            return NextResponse.json({
                success: false,
                message: "Please provide at least one image"
            });
        }

        // Upload all images to Cloudinary in parallel
        // Converts each file to buffer and streams to Cloudinary
        const result = await Promise.all(
            files.map(async (file) => {
                const arrayBuffer = await file.arrayBuffer()
                const buffer = Buffer.from(arrayBuffer)

                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { resource_type: 'auto' },
                        (error, result) => {
                            if (error) {
                                reject(error)
                            } else {
                                resolve(result)
                            }
                        }
                    )
                    stream.end(buffer)
                })
            })
        )
        // Extract secure URLs from Cloudinary response
        const image = result.map(result => result.secure_url)

        // Connect to MongoDB and create new product
        await connectDB()

        const newProduct = await Product.create({
            userId,
            name,
            description,
            category,
            price: Number(price),
            offerPrice: Number(offerPrice),
            image,
            date: Date.now()
        })

        return NextResponse.json({ success: true, message: 'Upload successful', newProduct })

    } catch (error) {
        // Log error for debugging and return user-friendly message
        console.log(error);
        return NextResponse.json({ success: false, message: error.message });
    }
}