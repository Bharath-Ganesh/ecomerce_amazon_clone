"use client";
import { productsDummyData, userDummyData } from "@/assets/assets";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { toast } from "react-hot-toast";
import axios from "axios";

// AppContext is a React context object that will be used to share state and functions across components
// It will be created using the createContext function
export const AppContext = createContext();

// useAppContext is a custom hook that returns the AppContext object
// It uses the useContext hook to access the AppContext object
export const useAppContext = () => {
  return useContext(AppContext);
};

// AppContextProvider is a wrapper component that provides global application state
// It uses React's Context API to share state and functions across components
// By wrapping children components, it enables state management throughout the app
export const AppContextProvider = (props) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY;

  // useRouter is a hook that returns the router object
  // It is used to navigate between pages in the app
  const router = useRouter();

  // useUser is a hook that returns the user object
  // It is used to access user information
  const { user } = useUser();

  // useAuth is a hook that returns the auth object
  // It is used to access authentication methods
  const { getToken } = useAuth();

  // useState is a hook that returns a state variable and a function to update it
  const [products, setProducts] = useState([]);
  const [userData, setUserData] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [cartItems, setCartItems] = useState({});

  const fetchProductData = async () => {
    setProducts(productsDummyData);
    // try {
    //   // Make API request to get product list
    //   const { data } = await axios.get("/api/product/list");

    //   // If successful, update products state
    //   if (data.success) {
    //     setProducts(data.products);
    //   } else {
    //     // Show error message if request failed
    //     toast.error(data.message);
    //   }
    // } catch (error) {
    //   // Show error message if request throws error
    //   toast.error(error.message);
    // }
  };

  // Role based auth
  // Fetches user data and checks if user has seller role in their metadata
  // If user is a seller, updates isSeller state to true
  // Sets dummy user data for development purposes
  const fetchUserData = async () => {
    try {
      if (user.publicMetadata.role === "seller") {
        setIsSeller(true);
      }
      const token = await getToken();
      const { data } = await axios.get("/api/user/data", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (data.success) {
        setUserData(data.user);
        setIsSeller(data.user.cart.length);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const addToCart = async (itemId) => {
    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      cartData[itemId] += 1;
    } else {
      cartData[itemId] = 1;
    }
    setCartItems(cartData);
    if (user) {
      try {
        const token = await getToken();
        await axios.post(
          "/api/cart/update",
          { cartData },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Item added to cart");
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const updateCartQuantity = async (itemId, quantity) => {
    let cartData = structuredClone(cartItems);
    if (quantity === 0) {
      delete cartData[itemId];
    } else {
      cartData[itemId] = quantity;
    }
    setCartItems(cartData);
    if (user) {
      try {
        const token = await getToken();
        await axios.post(
          "/api/cart/update",
          { cartData },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Cart updated");
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      if (cartItems[items] > 0) {
        totalCount += cartItems[items];
      }
    }
    return totalCount;
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = products.find((product) => product._id === items);
      if (cartItems[items] > 0) {
        totalAmount += itemInfo.offerPrice * cartItems[items];
      }
    }
    return Math.floor(totalAmount * 100) / 100;
  };

  useEffect(() => {
    fetchProductData();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const value = {
    user,
    getToken,
    currency,
    router,
    isSeller,
    setIsSeller,
    userData,
    fetchUserData,
    products,
    fetchProductData,
    cartItems,
    setCartItems,
    addToCart,
    updateCartQuantity,
    getCartCount,
    getCartAmount,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};
