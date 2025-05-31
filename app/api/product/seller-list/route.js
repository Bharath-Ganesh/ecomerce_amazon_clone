import { getAuth } from "@clerk/nextjs/server";

import { NextResponse } from "next/server";
import authSeller from "@/lib/authSeller";
import Product from "@/models/Product";
import connectDB from "@/config/db";

export async function GET(request) {
    try {
        // Get authenticated user ID from Clerk
        const { userId } = getAuth(request);

        // Verify user has seller privileges 
        const isSeller = await authSeller(userId);
        if (!isSeller) {
            return NextResponse.json({ success: false, message: 'Not authorized' });
        }

        await connectDB();

        const products = await Product.find({});

        return NextResponse.json({ success: true, products });

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}
