import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import brand from "../brand";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = brand.commerce.currencySymbol;
  const [delivery_fee, setDeliveryFee] = useState(brand.commerce.deliveryFee);
  const [settings, setSettings] = useState(null);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const navigate = useNavigate();

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [products, setProduucts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryTree, setCategoryTree] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");

  const addToCart = useCallback(
    async (itemId, size) => {
      if (!token) {
        toast.error("You need to login to use AddToCart");
        localStorage.setItem("redirectAfterLogin", `/product/${itemId}`);
        navigate("/login");
        return;
      }
      if (!size) {
        toast.error("Please select the Product Size");
        return;
      }

      setCartItems((prev) => {
        const cartData = structuredClone(prev);
        if (cartData[itemId]) {
          if (cartData[itemId][size]) {
            cartData[itemId][size] += 1;
          } else {
            cartData[itemId][size] = 1;
          }
        } else {
          cartData[itemId] = { [size]: 1 };
        }
        return cartData;
      });

      if (token) {
        try {
          await axios.post(
            backendUrl + "/api/cart/add",
            { itemId, size },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (error) {
          console.log(error);
          toast.error(error.message);
        }
      }
    },
    [token, backendUrl, navigate]
  );

  const cartCount = useMemo(() => {
    let totalCount = 0;
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        if (cartItems[items][item] > 0) {
          totalCount += cartItems[items][item];
        }
      }
    }
    return totalCount;
  }, [cartItems]);

  const getCartCount = useCallback(() => cartCount, [cartCount]);

  const updateQuantity = useCallback(
    async (itemId, size, quantity) => {
      setCartItems((prev) => {
        const cartData = structuredClone(prev);
        if (!cartData[itemId]) return prev;
        cartData[itemId][size] = quantity;
        return cartData;
      });

      if (token) {
        try {
          await axios.post(
            backendUrl + "/api/cart/update",
            { itemId, size, quantity },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (error) {
          console.log(error);
          toast.error(error.message);
        }
      }
    },
    [token, backendUrl]
  );

  const getCartAmount = useCallback(() => {
    let totalAmount = 0;
    for (const items in cartItems) {
      const itemInfo = products.find((product) => product._id === items);
      if (!itemInfo) continue;
      for (const item in cartItems[items]) {
        if (cartItems[items][item] > 0) {
          totalAmount += itemInfo.price * cartItems[items][item];
        }
      }
    }
    return totalAmount;
  }, [cartItems, products]);

  const getProductsData = useCallback(async () => {
    try {
      const response = await axios.get(backendUrl + "/api/product/list");
      if (response.data.success) {
        setProduucts(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  }, [backendUrl]);

  const getSettingsData = useCallback(async () => {
    try {
      const response = await axios.get(backendUrl + "/api/settings");
      if (response.data.success) {
        setSettings(response.data.settings);
        if (response.data.settings.deliveryFee !== undefined) {
          setDeliveryFee(response.data.settings.deliveryFee);
        }
      }
    } catch (error) {
      console.log("Error fetching settings:", error);
    }
  }, [backendUrl]);

  const getCategoriesData = useCallback(async () => {
    try {
      const response = await axios.get(backendUrl + "/api/categories/tree");
      if (response.data.success) {
        setCategories(response.data.categories || []);
        setCategoryTree(response.data.tree || []);
      }
    } catch (error) {
      console.log("Error fetching categories:", error);
    }
  }, [backendUrl]);

  const getUserCart = useCallback(
    async (authToken) => {
      try {
        const response = await axios.post(
          backendUrl + "/api/cart/get",
          {},
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        if (response.data.success) {
          setCartItems(response.data.cartData);
        }
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    },
    [backendUrl]
  );

  const getUserWishlist = useCallback(
    async (authToken) => {
      try {
        const response = await axios.post(
          backendUrl + "/api/wishlist/get",
          {},
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        if (response.data.success) {
          setWishlistItems(response.data.wishlist);
        }
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    },
    [backendUrl]
  );

  const addToWishlist = useCallback(
    async (productId) => {
      if (!token) {
        toast.error("You need to login to use Wishlist");
        return false;
      }

      const prev = wishlistItems;
      if (!prev.includes(productId)) {
        setWishlistItems([...prev, productId]);
      }

      try {
        const response = await axios.post(
          backendUrl + "/api/wishlist/add",
          { productId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.success) {
          toast.success("Added to Wishlist");
          return true;
        }
        setWishlistItems(prev);
        toast.error(response.data.message);
        return false;
      } catch (error) {
        setWishlistItems(prev);
        console.log(error);
        toast.error(error.message);
        return false;
      }
    },
    [token, backendUrl, wishlistItems]
  );

  const updateUserWishlist = useCallback(
    async (productId) => {
      if (!token) {
        toast.error("You need to login to update Wishlist");
        return false;
      }

      const prev = wishlistItems;
      setWishlistItems(prev.filter((id) => id !== productId));

      try {
        const response = await axios.post(
          backendUrl + "/api/wishlist/update",
          { productId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.success) {
          toast.success("Removed from Wishlist");
          return true;
        }
        setWishlistItems(prev);
        toast.error(response.data.message);
        return false;
      } catch (error) {
        setWishlistItems(prev);
        console.log(error);
        toast.error(error.message);
        return false;
      }
    },
    [token, backendUrl, wishlistItems]
  );

  useEffect(() => {
    getProductsData();
    getSettingsData();
    getCategoriesData();
  }, [getProductsData, getSettingsData, getCategoriesData]);

  // Single cart/wishlist hydrate when token is present
  useEffect(() => {
    if (token) {
      getUserCart(token);
      getUserWishlist(token);
    }
  }, [token, getUserCart, getUserWishlist]);

  const value = useMemo(
    () => ({
      products,
      currency,
      delivery_fee,
      navigate,
      search,
      setSearch,
      showSearch,
      setShowSearch,
      cartItems,
      addToCart,
      setCartItems,
      getCartCount,
      cartCount,
      updateQuantity,
      getCartAmount,
      backendUrl,
      token,
      setToken,
      wishlistItems,
      addToWishlist,
      getUserWishlist,
      setWishlistItems,
      updateUserWishlist,
      appliedCoupon,
      setAppliedCoupon,
      settings,
      categories,
      categoryTree,
    }),
    [
      products,
      currency,
      delivery_fee,
      navigate,
      search,
      showSearch,
      cartItems,
      addToCart,
      getCartCount,
      cartCount,
      updateQuantity,
      getCartAmount,
      backendUrl,
      token,
      wishlistItems,
      addToWishlist,
      getUserWishlist,
      updateUserWishlist,
      appliedCoupon,
      settings,
      categories,
      categoryTree,
    ]
  );

  return (
    <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
  );
};

export default ShopContextProvider;
