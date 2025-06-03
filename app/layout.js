import { Outfit } from "next/font/google";
import "./globals.css";
import { AppContextProvider } from "@/context/AppContext";
import { Toaster } from "react-hot-toast";
import { ClerkProvider } from "@clerk/nextjs";

const outfit = Outfit({ subsets: ['latin'], weight: ["300", "400", "500"] })

export const metadata = {
  title: "Amazon Clone",
  description: "E-Commerce with Next.js ",
};

// ClerkProvider is a wrapper component from Clerk authentication service
// It provides authentication context to all child components
// This means any component in our app can access authentication state and methods
// By wrapping our entire app with ClerkProvider, we ensure authentication features
// are available throughout the application
export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${outfit.className} antialiased text-gray-700`} >
          {/* Toaster is a component that displays toast notifications */}
          {/* It provides a way to show temporary messages or alerts to users */}
          {/* By placing it at the root layout, toasts can be triggered from anywhere in the app */}
          <Toaster />
          {/* AppContextProvider is a wrapper component that manages global application state */}
          {/* It uses React's Context API to share state and functions across components */}
          {/* By wrapping children components, it enables state management throughout the app */}
          <AppContextProvider>
            {children}
          </AppContextProvider>
        </body>
      </html>
    </ClerkProvider>

  );
}
