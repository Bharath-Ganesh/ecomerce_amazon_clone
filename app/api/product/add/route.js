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
        console.log("Inside the route");
        console.log(userId);

        // Verify user has seller privileges
        const isSeller = await authSeller(userId);
        if (!isSeller) {
            console.log("Not authorized");

            return NextResponse.json({ success: false, message: "Not authorized" });
        }


        // Extract product details from multipart form data
        const formData = await request.formData();
        const name = formData.get('name');

        const description = formData.get('description');
        const category = formData.get('category');
        const price = formData.get('price');
        const offerPrice = formData.get('offerPrice');

        console.log(name);
        console.log(description);
        console.log(category);
        console.log(price);
        console.log(offerPrice);
        // Validate image files are provided
        const files = formData.getAll('images');
        console.log(files);

        console.log(files);
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
        console.log(image);
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
        console.log("Error");
        console.log(error);
        return NextResponse.json({ success: false, message: error.message });
    }
}