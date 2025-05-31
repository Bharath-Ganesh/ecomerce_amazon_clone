import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import User from "@/models/User";
import connectDB from "@/config/db";

export async function POST(request) {
    try {
        // Get authenticated user ID from Clerk
        const { userId } = getAuth(request);

        // Get cart data from request body
        const { cartData } = await request.json();

        // Connect to database
        await connectDB();

        // Find user and update cart items
        const user = await User.findById(userId);
        user.cartItems = cartData;
        await user.save();

        return NextResponse.json({ success: true });

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}
