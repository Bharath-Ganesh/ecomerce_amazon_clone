"use client";
import React from "react";
import { assets, CartIcon, BagIcon, HomeIcon, BoxIcon } from "@/assets/assets";
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import { useClerk, UserButton } from "@clerk/nextjs";

const Navbar = () => {
  const { isSeller, router, user } = useAppContext();
  const { openSignIn } = useClerk();

  return (
    <>
      <nav className="flex items-center justify-between px-6 md:px-16 lg:px-32 py-3 border-b border-gray-300 text-gray-700">
        <Image
          className="cursor-pointer w-28 md:w-32"
          onClick={() => router.push("/")}
          src={assets.logo}
          alt="logo"
        />
        <div className="flex items-center gap-4 lg:gap-8 max-md:hidden">
          <Link href="/" className="hover:text-gray-900 transition">
            Home
          </Link>
          <Link href="/all-products" className="hover:text-gray-900 transition">
            Shop
          </Link>
          <Link href="/" className="hover:text-gray-900 transition">
            About Us
          </Link>
          <Link href="/" className="hover:text-gray-900 transition">
            Contact
          </Link>

          {isSeller && (
            <button
              onClick={() => router.push("/seller")}
              className="text-xs border px-4 py-1.5 rounded-full"
            >
              Seller Dashboard
            </button>
          )}
        </div>
        {/*

            The `user` variable is obtained from the custom AppContext (see context/AppContext.jsx),
            which provides global state for authentication and routing throughout the app. This context
            is set up using React's Context API and populated by Clerk's authentication hooks.

            Here, we conditionally render different UI elements based on whether a user is signed in:
              - If `user` is truthy (i.e., a user is authenticated), we show the Clerk <UserButton> component,
                which provides a dropdown menu with actions for Cart and My Orders. These actions use the
                Next.js router (from context) to navigate to the respective pages.
              - If `user` is falsy (i.e., no user is authenticated), we show an Account button that triggers
                the Clerk sign-in modal via the `openSignIn` function from Clerk's useClerk hook.

            This pattern is essential for debugging authentication flows in Next.js apps using Clerk:
              - If the wrong UI is shown, check how `user` is set in AppContext and whether Clerk is properly initialized.
              - If navigation doesn't work, check the router logic in AppContext.
              - If sign-in doesn't trigger, ensure `openSignIn` is correctly imported from Clerk.

            Understanding this conditional helps you trace authentication state and UI rendering, which is
            a common pattern in modern React/Next.js apps with third-party auth providers.
          
         */}
        <ul className="hidden md:flex items-center gap-4 ">
          <Image
            className="w-4 h-4"
            src={assets.search_icon}
            alt="search icon"
          />

          {user ? (
            <>
              <UserButton>
                <UserButton.MenuItems>
                  <UserButton.Action
                    label="Cart"
                    labelIcon={<CartIcon />}
                    onClick={() => router.push("/cart")}
                  />
                </UserButton.MenuItems>
                <UserButton.MenuItems>
                  <UserButton.Action
                    label="My Orders"
                    labelIcon={<BagIcon />}
                    onClick={() => router.push("/my-orders")}
                  />
                </UserButton.MenuItems>
              </UserButton>
            </>
          ) : (
            <button
              onClick={openSignIn}
              className="flex items-center gap-2 hover:text-gray-900 transition"
            >
              <Image src={assets.user_icon} alt="user icon" />
              Account
            </button>
          )}
        </ul>

        <div className="flex items-center md:hidden gap-3">
          {isSeller && (
            <button
              onClick={() => router.push("/seller")}
              className="text-xs border px-4 py-1.5 rounded-full"
            >
              Seller Dashboard
            </button>
          )}
          {user ? (
            <>
              <UserButton>
                <UserButton.MenuItems>
                  <UserButton.Action
                    label="Home"
                    labelIcon={<HomeIcon />}
                    onClick={() => router.push("/")}
                  />
                </UserButton.MenuItems>
                <UserButton.MenuItems>
                  <UserButton.Action
                    label="Products"
                    labelIcon={<BoxIcon />}
                    onClick={() => router.push("/all-products")}
                  />
                </UserButton.MenuItems>
                <UserButton.MenuItems>
                  <UserButton.Action
                    label="Cart"
                    labelIcon={<CartIcon />}
                    onClick={() => router.push("/cart")}
                  />
                </UserButton.MenuItems>
                <UserButton.MenuItems>
                  <UserButton.Action
                    label="My Orders"
                    labelIcon={<BagIcon />}
                    onClick={() => router.push("/my-orders")}
                  />
                </UserButton.MenuItems>
              </UserButton>
            </>
          ) : (
            <button
              onClick={openSignIn}
              className="flex items-center gap-2 hover:text-gray-900 transition"
            >
              <Image src={assets.user_icon} alt="user icon" />
              Account
            </button>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
