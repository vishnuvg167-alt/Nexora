import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";

import { createOrderThunk } from "../redux/slices/orderSlice";
import { clearCartThunk } from "../redux/slices/cartSlice";
import { fetchAddresses } from "../redux/slices/addressSlice";

import loadRazorpay from "../utils/loadRazorPay";
import { getCouponByCode } from "../services/couponService";

import {
  getProductById,
  updateProductStock,
  updateProductVariants,
} from "../services/productService";

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  /* =====================================================
     REDUX
  ===================================================== */

  const { items: cartItems, cartId } = useSelector(
    (state) => state.cart
  );

  const user = useSelector((state) => state.auth.user);

  const { loading, error } = useSelector(
    (state) => state.orders
  );

  const {
    items: savedAddresses,
    loading: addressesLoading,
    error: addressesError,
  } = useSelector((state) => state.addresses);

  /* =====================================================
     CHECKOUT MODE
  ===================================================== */

  const buyNowItem = location.state?.buyNowItem;
  const isBuyNow = Boolean(buyNowItem);

  const checkoutItems = isBuyNow
    ? [buyNowItem]
    : cartItems;

  /* =====================================================
     FORM
  ===================================================== */

  const [formData, setFormData] = useState({
    name: "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [paymentOpening, setPaymentOpening] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  /* =====================================================
     PAYMENT METHOD
  ===================================================== */

  const [paymentMethod, setPaymentMethod] = useState("razorpay");

  /* =====================================================
     COUPON
  ===================================================== */

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  /* =====================================================
     FETCH SAVED ADDRESSES
  ===================================================== */

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchAddresses(user.id));
    }
  }, [dispatch, user?.id]);

  /* =====================================================
     KEEP EMAIL IN SYNC
  ===================================================== */

  useEffect(() => {
    if (!user?.email) return;

    setFormData((prev) => ({
      ...prev,
      email: prev.email || user.email,
    }));
  }, [user?.email]);

  /* =====================================================
     AUTO SELECT DEFAULT ADDRESS
  ===================================================== */

  useEffect(() => {
    if (savedAddresses.length === 0 || selectedAddressId) {
      return;
    }

    const defaultAddress =
      savedAddresses.find((address) => address.isDefault) ||
      savedAddresses[0];

    setSelectedAddressId(defaultAddress.id);

    setFormData({
      name: defaultAddress.name || "",
      email: user?.email || "",
      phone: defaultAddress.phone || "",
      address: defaultAddress.address || "",
      city: defaultAddress.city || "",
      state: defaultAddress.state || "",
      pincode: defaultAddress.pincode || "",
    });

    setFormErrors({});
  }, [savedAddresses, selectedAddressId, user?.email]);

  /* =====================================================
     SELECT SAVED ADDRESS
  ===================================================== */

  const handleSelectAddress = (address) => {
    setSelectedAddressId(address.id);

    setFormData({
      name: address.name || "",
      email: user?.email || "",
      phone: address.phone || "",
      address: address.address || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
    });

    setFormErrors({});
  };

  /* =====================================================
     TOTALS
  ===================================================== */

  const subtotal = checkoutItems.reduce(
    (total, item) =>
      total + Number(item.price) * Number(item.quantity),
    0
  );

  const shipping = 0;

  const calculateCouponDiscount = (coupon) => {
    if (!coupon) return 0;

    if (coupon.type === "percentage") {
      const percentageDiscount =
        (subtotal * Number(coupon.value)) / 100;

      if (
        coupon.maxDiscount !== null &&
        coupon.maxDiscount !== undefined
      ) {
        return Math.min(
          percentageDiscount,
          Number(coupon.maxDiscount)
        );
      }

      return percentageDiscount;
    }

    if (coupon.type === "fixed") {
      return Math.min(Number(coupon.value), subtotal);
    }

    return 0;
  };

  const discount = calculateCouponDiscount(appliedCoupon);

  const total = Math.max(
    subtotal + shipping - discount,
    0
  );

  const totalItems = checkoutItems.reduce(
    (total, item) => total + Number(item.quantity),
    0
  );

  /* =====================================================
     COUPON VALIDATION
  ===================================================== */

  const validateCouponData = (coupon) => {
    if (!coupon) {
      throw new Error("Invalid coupon code.");
    }

    if (coupon.isActive !== true) {
      throw new Error("This coupon is currently inactive.");
    }

    if (coupon.expiryDate) {
      const expiryTime = new Date(coupon.expiryDate).getTime();

      if (
        Number.isNaN(expiryTime) ||
        expiryTime < Date.now()
      ) {
        throw new Error("This coupon has expired.");
      }
    }

    const minimumOrder = Number(coupon.minOrder || 0);

    if (subtotal < minimumOrder) {
      throw new Error(
        `Minimum order value for this coupon is ₹${minimumOrder.toLocaleString(
          "en-IN"
        )}.`
      );
    }

    if (!["percentage", "fixed"].includes(coupon.type)) {
      throw new Error(
        "This coupon has an invalid discount type."
      );
    }

    const couponValue = Number(coupon.value);

    if (
      !Number.isFinite(couponValue) ||
      couponValue <= 0
    ) {
      throw new Error(
        "This coupon has an invalid discount value."
      );
    }

    if (
      coupon.type === "percentage" &&
      couponValue > 100
    ) {
      throw new Error(
        "This coupon has an invalid percentage value."
      );
    }

    return true;
  };

  /* =====================================================
     APPLY COUPON
  ===================================================== */

  const handleApplyCoupon = async () => {
    const normalizedCode = couponCode
      .trim()
      .toUpperCase();

    setCouponError("");

    if (!normalizedCode) {
      setCouponError("Enter a coupon code.");
      return;
    }

    setCouponLoading(true);

    try {
      const coupon = await getCouponByCode(normalizedCode);

      validateCouponData(coupon);

      setAppliedCoupon(coupon);
      setCouponCode(coupon.code);
      setCouponError("");
    } catch (error) {
      console.error("Coupon validation failed:", error);

      setAppliedCoupon(null);
      setCouponError(
        error.message || "Unable to validate coupon."
      );
    } finally {
      setCouponLoading(false);
    }
  };

  /* =====================================================
     REMOVE COUPON
  ===================================================== */

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  /* =====================================================
     COUPON INPUT CHANGE
  ===================================================== */

  const handleCouponChange = (e) => {
    setCouponCode(e.target.value.toUpperCase());
    setCouponError("");
  };

  /* =====================================================
     REVALIDATE APPLIED COUPON
  ===================================================== */

  const revalidateAppliedCoupon = async () => {
    if (!appliedCoupon) return null;

    const latestCoupon = await getCouponByCode(
      appliedCoupon.code
    );

    validateCouponData(latestCoupon);

    return latestCoupon;
  };

  /* =====================================================
     FORM VALIDATION
  ===================================================== */

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Full name is required";
    } else if (formData.name.trim().length < 3) {
      errors.name =
        "Name must contain at least 3 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = "Enter a valid email address";
    }

    const phoneRegex = /^[6-9]\d{9}$/;

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!phoneRegex.test(formData.phone.trim())) {
      errors.phone =
        "Enter a valid 10-digit Indian phone number";
    }

    if (!formData.address.trim()) {
      errors.address = "Delivery address is required";
    } else if (formData.address.trim().length < 10) {
      errors.address =
        "Please enter a complete delivery address";
    }

    const cityRegex = /^[A-Za-z\s.-]+$/;

    if (!formData.city.trim()) {
      errors.city = "City is required";
    } else if (formData.city.trim().length < 2) {
      errors.city = "Enter a valid city";
    } else if (!cityRegex.test(formData.city.trim())) {
      errors.city = "City should contain only letters";
    }

    const stateRegex = /^[A-Za-z\s.-]+$/;

    if (!formData.state.trim()) {
      errors.state = "State is required";
    } else if (!stateRegex.test(formData.state.trim())) {
      errors.state = "State should contain only letters";
    }

    const pincodeRegex = /^[1-9][0-9]{5}$/;

    if (!formData.pincode.trim()) {
      errors.pincode = "PIN code is required";
    } else if (!pincodeRegex.test(formData.pincode.trim())) {
      errors.pincode = "Enter a valid 6-digit PIN code";
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  /* =====================================================
     FORM CHANGE
  ===================================================== */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  /* =====================================================
     PRODUCT HELPERS
  ===================================================== */

  const hasVariants = (product) =>
    Array.isArray(product?.variants) &&
    product.variants.length > 0;

  const getItemDescription = (item) => {
    if (item.variantLabel) {
      return `${item.name} (${item.variantLabel})`;
    }

    return item.name;
  };

  /* =====================================================
     GROUP CHECKOUT ITEMS BY PRODUCT
  ===================================================== */

  const groupCheckoutItemsByProduct = () => {
    const groupedItems = new Map();

    for (const item of checkoutItems) {
      if (!item?.id) {
        throw new Error(
          "One of the checkout products is invalid."
        );
      }

      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new Error(
          `Invalid quantity for ${item.name || "product"}.`
        );
      }

      const productKey = String(item.id);

      if (!groupedItems.has(productKey)) {
        groupedItems.set(productKey, []);
      }

      groupedItems.get(productKey).push(item);
    }

    return groupedItems;
  };

  /* =====================================================
     PREPARE CHECKOUT
  ===================================================== */

  /*
   * This is the central checkout preparation step.
   *
   * For each unique product:
   *
   * 1. Fetch latest product once.
   * 2. Validate requested quantities.
   * 3. Build after-sales policy snapshot.
   * 4. Prepare final inventory state.
   *
   * This is especially important when the cart contains
   * multiple variants of the same product.
   */

  const prepareCheckout = async () => {
    const groupedItems = groupCheckoutItemsByProduct();

    const policySnapshots = [];
    const inventoryUpdates = [];

    for (const productItems of groupedItems.values()) {
      const firstItem = productItems[0];

      const latestProduct = await getProductById(
        firstItem.id
      );

      if (!latestProduct) {
        throw new Error(
          `${firstItem.name || "Product"} is no longer available.`
        );
      }

      /* ================= POLICY SNAPSHOT ================= */

      const returnEligible =
        latestProduct.returnEligible === true;

      const replacementEligible =
        latestProduct.replacementEligible === true;

      policySnapshots.push({
        productId: String(latestProduct.id),

        returnEligible,

        returnWindowDays: returnEligible
          ? Number(latestProduct.returnWindowDays || 0)
          : 0,

        replacementEligible,

        replacementWindowDays: replacementEligible
          ? Number(
              latestProduct.replacementWindowDays || 0
            )
          : 0,
      });

      /* ================= VARIANT PRODUCT ================= */

      if (hasVariants(latestProduct)) {
        const updatedVariants = latestProduct.variants.map(
          (variant) => ({
            ...variant,
            stock: Number(variant.stock),
          })
        );

        for (const variant of updatedVariants) {
          if (
            !Number.isInteger(variant.stock) ||
            variant.stock < 0
          ) {
            throw new Error(
              `Invalid stock for ${
                variant.label || latestProduct.name
              }.`
            );
          }
        }

        for (const item of productItems) {
          if (!item.variantId) {
            throw new Error(
              `Please select a configuration for ${item.name}.`
            );
          }

          const variantIndex = updatedVariants.findIndex(
            (variant) =>
              String(variant.id) ===
              String(item.variantId)
          );

          if (variantIndex === -1) {
            throw new Error(
              `${getItemDescription(
                item
              )} is no longer available.`
            );
          }

          const requestedQuantity = Number(item.quantity);

          const currentStock = Number(
            updatedVariants[variantIndex].stock
          );

          if (currentStock <= 0) {
            throw new Error(
              `${getItemDescription(
                item
              )} is currently out of stock.`
            );
          }

          if (requestedQuantity > currentStock) {
            throw new Error(
              `Only ${currentStock} ${
                currentStock === 1 ? "unit" : "units"
              } of ${getItemDescription(item)} ${
                currentStock === 1 ? "is" : "are"
              } currently available.`
            );
          }

          updatedVariants[variantIndex] = {
            ...updatedVariants[variantIndex],
            stock: currentStock - requestedQuantity,
          };
        }

        const totalVariantStock = updatedVariants.reduce(
          (total, variant) =>
            total + Number(variant.stock),
          0
        );

        inventoryUpdates.push({
          type: "variant",
          productId: latestProduct.id,
          variants: updatedVariants,
          stock: totalVariantStock,
        });

        continue;
      }

      /* ================= SIMPLE PRODUCT ================= */

      const currentStock = Number(latestProduct.stock);

      if (
        !Number.isInteger(currentStock) ||
        currentStock < 0
      ) {
        throw new Error(
          `Invalid stock for ${
            latestProduct.name || firstItem.name
          }.`
        );
      }

      const requestedQuantity = productItems.reduce(
        (total, item) =>
          total + Number(item.quantity),
        0
      );

      if (currentStock <= 0) {
        throw new Error(
          `${
            latestProduct.name || firstItem.name
          } is currently out of stock.`
        );
      }

      if (requestedQuantity > currentStock) {
        throw new Error(
          `Only ${currentStock} ${
            currentStock === 1 ? "unit" : "units"
          } of ${
            latestProduct.name || firstItem.name
          } ${
            currentStock === 1 ? "is" : "are"
          } currently available.`
        );
      }

      inventoryUpdates.push({
        type: "simple",
        productId: latestProduct.id,
        stock: currentStock - requestedQuantity,
      });
    }

    return {
      policySnapshots,
      inventoryUpdates,
    };
  };

  /* =====================================================
     APPLY INVENTORY UPDATE
  ===================================================== */

  const applyInventoryUpdate = async (update) => {
    if (update.type === "variant") {
      await updateProductVariants(
        update.productId,
        update.variants,
        update.stock
      );

      return;
    }

    if (update.type === "simple") {
      await updateProductStock(
        update.productId,
        update.stock
      );

      return;
    }

    throw new Error("Invalid inventory update.");
  };

  /* =====================================================
     APPLY INVENTORY UPDATES
  ===================================================== */

  const applyInventoryUpdates = async (updates) => {
    if (!Array.isArray(updates) || updates.length === 0) {
      throw new Error(
        "No inventory updates were prepared."
      );
    }

    for (const update of updates) {
      await applyInventoryUpdate(update);
    }
  };

  /* =====================================================
     BUILD ORDER DATA
  ===================================================== */

  const buildOrderData = ({
    method,
    paymentStatus,
    paymentId = null,
    coupon = appliedCoupon,
    policySnapshots = [],
  }) => {
    const orderDiscount =
      calculateCouponDiscount(coupon);

    const orderTotal = Math.max(
      subtotal + shipping - orderDiscount,
      0
    );

    /*
     * Every order item stores a historical
     * purchase-policy snapshot.
     *
     * Changing the product policy later must
     * not change an existing order.
     */

    const orderItems = checkoutItems.map((item) => {
      const policy = policySnapshots.find(
        (snapshot) =>
          String(snapshot.productId) ===
          String(item.id)
      );

      return {
        id: item.id,
        name: item.name,
        brand: item.brand || "NEXORA",
        category: item.category || "",
        thumbnail: item.thumbnail || "",
        price: Number(item.price),
        quantity: Number(item.quantity),

        /* ================= VARIANT SNAPSHOT ================= */

        variantId: item.variantId || null,
        variantLabel: item.variantLabel || null,

        variantAttributes: item.variantAttributes
          ? { ...item.variantAttributes }
          : null,

        /* ================= POLICY SNAPSHOT ================= */

        returnEligible:
          policy?.returnEligible === true,

        returnWindowDays:
          policy?.returnEligible === true
            ? Number(policy.returnWindowDays || 0)
            : 0,

        replacementEligible:
          policy?.replacementEligible === true,

        replacementWindowDays:
          policy?.replacementEligible === true
            ? Number(
                policy.replacementWindowDays || 0
              )
            : 0,
      };
    });

    return {
      userId: user.id,

      items: orderItems,

      shippingAddress: {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
      },

      subtotal,
      discount: orderDiscount,
      shipping,
      total: orderTotal,

      coupon: coupon
        ? {
            id: coupon.id,
            code: coupon.code,
            type: coupon.type,
            value: Number(coupon.value),
            minOrder: Number(coupon.minOrder || 0),
            maxDiscount: coupon.maxDiscount ?? null,
          }
        : null,

      paymentMethod: method,
      paymentStatus,
      paymentId,

      status: "placed",

      createdAt: new Date().toISOString(),
    };
  };

  /* =====================================================
     COMPLETE ORDER
  ===================================================== */

  const completeOrder = async (orderData) => {
    await dispatch(
      createOrderThunk(orderData)
    ).unwrap();

    if (!isBuyNow) {
      await dispatch(
        clearCartThunk(cartId)
      ).unwrap();
    }

    navigate("/orders");
  };

  /* =====================================================
     CASH ON DELIVERY
  ===================================================== */

  const handleCODOrder = async () => {
    try {
      /* ================= COUPON ================= */

      const latestCoupon =
        await revalidateAppliedCoupon();

      /* ================= CHECKOUT PREPARATION ================= */

      const {
        policySnapshots,
        inventoryUpdates,
      } = await prepareCheckout();

      /* ================= INVENTORY ================= */

      await applyInventoryUpdates(inventoryUpdates);

      /* ================= ORDER ================= */

      const orderData = buildOrderData({
        method: "cod",
        paymentStatus: "pending",
        paymentId: null,
        coupon: latestCoupon,
        policySnapshots,
      });

      await completeOrder(orderData);
    } catch (error) {
      console.error("COD order failed:", error);

      alert(
        error.message ||
          "Unable to place your Cash on Delivery order."
      );

      throw error;
    }
  };

  /* =====================================================
     RAZORPAY PAYMENT
  ===================================================== */

  const handleRazorpayPayment = async () => {
    /*
     * Validate availability before opening Razorpay.
     * No inventory mutation happens yet.
     */

    await prepareCheckout();

    /* ================= COUPON ================= */

    const latestCouponBeforePayment =
      await revalidateAppliedCoupon();

    const payableDiscount =
      calculateCouponDiscount(
        latestCouponBeforePayment
      );

    const payableTotal = Math.max(
      subtotal + shipping - payableDiscount,
      0
    );

    /* ================= LOAD RAZORPAY ================= */

    const loaded = await loadRazorpay();

    if (!loaded) {
      throw new Error(
        "Razorpay could not be loaded. Please check your internet connection."
      );
    }

    /* ================= KEY ================= */

    const razorpayKey =
      import.meta.env.VITE_RAZORPAY_KEY_ID;

    if (!razorpayKey) {
      throw new Error(
        "Razorpay Test Key is missing. Check your .env file."
      );
    }

    /* ================= OPTIONS ================= */

    const options = {
      key: razorpayKey,

      amount: Math.round(payableTotal * 100),

      currency: "INR",

      name: "NEXORA",

      description: "NEXORA Test Purchase",

      /* =================================================
         PAYMENT SUCCESS
      ================================================= */

      handler: async function (response) {
        try {
          /*
           * Re-fetch products after payment.
           *
           * Availability may have changed while
           * the Razorpay modal was open.
           */

          const {
            policySnapshots,
            inventoryUpdates,
          } = await prepareCheckout();

          /* ================= COUPON REVALIDATION ================= */

          const latestCoupon =
            latestCouponBeforePayment
              ? await revalidateAppliedCoupon()
              : null;

          const latestDiscount =
            calculateCouponDiscount(latestCoupon);

          const latestTotal = Math.max(
            subtotal + shipping - latestDiscount,
            0
          );

          /*
           * Never create an order whose total
           * differs from the amount already paid.
           */

          if (
            Math.round(latestTotal * 100) !==
            Math.round(payableTotal * 100)
          ) {
            throw new Error(
              "The coupon changed while payment was in progress. Please contact support because the payment amount no longer matches the order total."
            );
          }

          /* ================= INVENTORY ================= */

          await applyInventoryUpdates(
            inventoryUpdates
          );

          /* ================= ORDER ================= */

          const orderData = buildOrderData({
            method: "razorpay",
            paymentStatus: "paid",
            paymentId:
              response.razorpay_payment_id,
            coupon: latestCoupon,
            policySnapshots,
          });

          await completeOrder(orderData);
        } catch (error) {
          console.error(
            "Checkout failed:",
            error
          );

          alert(
            error.message ||
              "The order could not be completed because availability changed."
          );
        } finally {
          setPaymentOpening(false);
        }
      },

      /* ================= CUSTOMER ================= */

      prefill: {
        name: formData.name.trim(),
        email: formData.email.trim(),
        contact: formData.phone.trim(),
      },

      /* ================= NOTES ================= */

      notes: {
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        coupon:
          latestCouponBeforePayment?.code ||
          "NONE",
      },

      theme: {
        color: "#123F32",
      },

      modal: {
        ondismiss: function () {
          setPaymentOpening(false);
        },
      },
    };

    const paymentObject =
      new window.Razorpay(options);

    paymentObject.on(
      "payment.failed",
      function (response) {
        setPaymentOpening(false);

        console.error(
          "Payment failed:",
          response.error
        );

        alert(
          "Payment failed. Please try again."
        );
      }
    );

    paymentObject.open();
  };

  /* =====================================================
     SUBMIT
  ===================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      paymentOpening ||
      loading ||
      couponLoading
    ) {
      return;
    }

    if (!validateForm()) return;

    setPaymentOpening(true);

    /* ================= COD ================= */

    if (paymentMethod === "cod") {
      try {
        await handleCODOrder();
      } catch {
        // Error already handled.
      } finally {
        setPaymentOpening(false);
      }

      return;
    }

    /* ================= RAZORPAY ================= */

    try {
      await handleRazorpayPayment();
    } catch (error) {
      console.error(
        "Unable to start payment:",
        error
      );

      alert(
        error.message ||
          "Unable to start Razorpay. Please try again."
      );

      setPaymentOpening(false);
    }
  };

  /* =====================================================
     EMPTY CHECKOUT
  ===================================================== */

  if (checkoutItems.length === 0) {
    return (
      <main className="min-h-screen bg-nexora-ivory px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto flex min-h-[65vh] max-w-3xl items-center justify-center">
          <div className="w-full rounded-[2rem] border border-nexora-border bg-nexora-surface px-6 py-16 text-center sm:px-10 sm:py-20">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-nexora-primary-soft">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                className="h-6 w-6 text-nexora-primary"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L20 8H7"
                />
                <circle cx="10" cy="20" r="1" />
                <circle cx="18" cy="20" r="1" />
              </svg>
            </div>

            <p className="mt-7 text-[11px] font-bold uppercase tracking-[0.3em] text-nexora-taupe">
              NEXORA / CHECKOUT
            </p>

            <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] text-nexora-text sm:text-5xl">
              Your cart is empty.
            </h1>

            <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-nexora-muted">
              Add some hardware to your cart before
              continuing to checkout.
            </p>

            <Link
              to="/products"
              className="group mt-8 inline-flex items-center gap-3 rounded-full bg-nexora-primary px-7 py-3.5 text-sm font-bold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-nexora-primary-hover"
            >
              Explore Products
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /* =====================================================
     FORM STYLES
  ===================================================== */

  const inputClass =
    "w-full rounded-2xl border border-nexora-border bg-nexora-ivory px-4 py-4 text-sm font-medium text-nexora-text outline-none transition placeholder:text-nexora-taupe hover:border-nexora-taupe focus:border-nexora-primary focus:bg-nexora-surface focus:ring-4 focus:ring-nexora-primary/10";

  const errorInputClass =
    "w-full rounded-2xl border border-red-400 bg-red-50/40 px-4 py-4 text-sm font-medium text-nexora-text outline-none transition placeholder:text-nexora-taupe focus:border-red-500 focus:bg-nexora-surface focus:ring-4 focus:ring-red-500/10";

  const labelClass =
    "mb-2.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-nexora-taupe";

  const errorClass =
    "mt-2 text-xs font-medium text-red-500";

  /* =====================================================
     UI
  ===================================================== */

  return (
    <main className="min-h-screen bg-nexora-ivory">
      {/* ================= HEADER ================= */}

      <section className="border-b border-nexora-border bg-nexora-surface">
        <div className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-nexora-taupe" />

                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-nexora-taupe">
                  NEXORA / CHECKOUT
                </p>
              </div>

              <h1 className="mt-6 text-4xl font-black leading-[0.95] tracking-[-0.045em] text-nexora-text sm:text-6xl">
                Complete
                <span className="block text-nexora-taupe">
                  your order.
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-sm leading-6 text-nexora-muted sm:text-base">
                Choose your delivery address and
                preferred payment method.
              </p>
            </div>

            <Link
              to={
                isBuyNow
                  ? `/products/${buyNowItem.id}`
                  : "/cart"
              }
              className="group inline-flex items-center gap-2 text-sm font-semibold text-nexora-muted transition hover:text-nexora-primary"
            >
              <span className="transition-transform duration-300 group-hover:-translate-x-1">
                ←
              </span>

              {isBuyNow
                ? "Back to product"
                : "Back to cart"}
            </Link>
          </div>
        </div>
      </section>

      {/* ================= CONTENT ================= */}

      <section className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px] xl:gap-12">
          {/* ================= LEFT ================= */}

          <section className="overflow-hidden rounded-[2rem] border border-nexora-border bg-nexora-surface">
            <div className="border-b border-nexora-border p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-nexora-primary text-[11px] font-bold text-white">
                  01
                </span>

                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-nexora-taupe">
                  Delivery
                </p>
              </div>

              <h2 className="mt-5 text-2xl font-black tracking-[-0.03em] text-nexora-text sm:text-3xl">
                Shipping information
              </h2>

              <p className="mt-2 text-sm leading-6 text-nexora-muted">
                Select a saved address or enter your
                delivery information below.
              </p>
            </div>

            {error && (
              <div className="mx-6 mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 sm:mx-8">
                <p className="text-sm text-red-600">
                  {error}
                </p>
              </div>
            )}

            {addressesError && (
              <div className="mx-6 mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 sm:mx-8">
                <p className="text-sm text-amber-700">
                  Saved addresses could not be loaded.
                  You can still enter your delivery
                  information manually.
                </p>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              noValidate
              className="p-6 sm:p-8"
            >
              {/* ================= SAVED ADDRESSES ================= */}

              <div className="mb-8">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-nexora-taupe">
                      Saved Addresses
                    </p>

                    <p className="mt-1 text-xs text-nexora-muted">
                      Select a saved delivery address.
                    </p>
                  </div>

                  <Link
                    to="/account#addresses"
                    className="text-xs font-bold text-nexora-primary transition hover:text-nexora-primary-hover"
                  >
                    Manage
                  </Link>
                </div>

                {addressesLoading ? (
                  <div className="mt-4 rounded-2xl border border-nexora-border bg-nexora-ivory p-5">
                    <p className="text-sm text-nexora-muted">
                      Loading saved addresses...
                    </p>
                  </div>
                ) : savedAddresses.length > 0 ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {savedAddresses.map((savedAddress) => {
                      const isSelected =
                        String(selectedAddressId) ===
                        String(savedAddress.id);

                      return (
                        <button
                          key={savedAddress.id}
                          type="button"
                          onClick={() =>
                            handleSelectAddress(
                              savedAddress
                            )
                          }
                          className={`relative rounded-2xl border p-4 text-left transition ${
                            isSelected
                              ? "border-nexora-primary bg-nexora-primary-soft"
                              : "border-nexora-border bg-nexora-ivory hover:border-nexora-taupe"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-bold text-nexora-text">
                                  {savedAddress.label ||
                                    "Address"}
                                </p>

                                {savedAddress.isDefault && (
                                  <span className="rounded-full bg-nexora-primary px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                                    Default
                                  </span>
                                )}
                              </div>

                              <p className="mt-3 text-sm font-semibold text-nexora-text">
                                {savedAddress.name}
                              </p>

                              <p className="mt-1 text-xs leading-5 text-nexora-muted">
                                {savedAddress.address}
                                <br />
                                {savedAddress.city}
                                {savedAddress.state &&
                                  `, ${savedAddress.state}`}
                                {savedAddress.pincode &&
                                  ` - ${savedAddress.pincode}`}
                              </p>

                              <p className="mt-2 text-xs text-nexora-muted">
                                {savedAddress.phone}
                              </p>
                            </div>

                            <span
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                                isSelected
                                  ? "border-nexora-primary bg-nexora-primary"
                                  : "border-nexora-taupe"
                              }`}
                            >
                              {isSelected && (
                                <span className="h-2 w-2 rounded-full bg-white" />
                              )}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-dashed border-nexora-border bg-nexora-ivory p-5">
                    <p className="text-sm font-semibold text-nexora-text">
                      No saved addresses
                    </p>

                    <p className="mt-1 text-xs leading-5 text-nexora-muted">
                      Enter your delivery information
                      below or save an address from your
                      account.
                    </p>

                    <Link
                      to="/account#addresses"
                      className="mt-3 inline-flex text-xs font-bold text-nexora-primary transition hover:text-nexora-primary-hover"
                    >
                      Add saved address →
                    </Link>
                  </div>
                )}
              </div>

              {/* ================= DELIVERY DETAILS ================= */}

              <div className="border-t border-nexora-border pt-8">
                <div className="mb-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-nexora-taupe">
                    Delivery Details
                  </p>

                  <p className="mt-1 text-xs text-nexora-muted">
                    Review or edit the delivery
                    information before placing your
                    order.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="name"
                        className={labelClass}
                      >
                        Full Name
                      </label>

                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        autoComplete="name"
                        placeholder="Your full name"
                        aria-invalid={!!formErrors.name}
                        className={
                          formErrors.name
                            ? errorInputClass
                            : inputClass
                        }
                      />

                      {formErrors.name && (
                        <p className={errorClass}>
                          {formErrors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className={labelClass}
                      >
                        Email Address
                      </label>

                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        autoComplete="email"
                        placeholder="you@example.com"
                        aria-invalid={!!formErrors.email}
                        className={
                          formErrors.email
                            ? errorInputClass
                            : inputClass
                        }
                      />

                      {formErrors.email && (
                        <p className={errorClass}>
                          {formErrors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className={labelClass}
                    >
                      Phone Number
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      inputMode="numeric"
                      maxLength="10"
                      value={formData.phone}
                      onChange={handleChange}
                      autoComplete="tel"
                      placeholder="10-digit mobile number"
                      aria-invalid={!!formErrors.phone}
                      className={
                        formErrors.phone
                          ? errorInputClass
                          : inputClass
                      }
                    />

                    {formErrors.phone && (
                      <p className={errorClass}>
                        {formErrors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="address"
                      className={labelClass}
                    >
                      Delivery Address
                    </label>

                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows="4"
                      autoComplete="street-address"
                      placeholder="House / building, street, area"
                      aria-invalid={!!formErrors.address}
                      className={`${
                        formErrors.address
                          ? errorInputClass
                          : inputClass
                      } resize-none`}
                    />

                    {formErrors.address && (
                      <p className={errorClass}>
                        {formErrors.address}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    <div>
                      <label
                        htmlFor="city"
                        className={labelClass}
                      >
                        City
                      </label>

                      <input
                        id="city"
                        name="city"
                        type="text"
                        value={formData.city}
                        onChange={handleChange}
                        autoComplete="address-level2"
                        placeholder="City"
                        aria-invalid={!!formErrors.city}
                        className={
                          formErrors.city
                            ? errorInputClass
                            : inputClass
                        }
                      />

                      {formErrors.city && (
                        <p className={errorClass}>
                          {formErrors.city}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="state"
                        className={labelClass}
                      >
                        State
                      </label>

                      <input
                        id="state"
                        name="state"
                        type="text"
                        value={formData.state}
                        onChange={handleChange}
                        autoComplete="address-level1"
                        placeholder="State"
                        aria-invalid={!!formErrors.state}
                        className={
                          formErrors.state
                            ? errorInputClass
                            : inputClass
                        }
                      />

                      {formErrors.state && (
                        <p className={errorClass}>
                          {formErrors.state}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="pincode"
                        className={labelClass}
                      >
                        PIN Code
                      </label>

                      <input
                        id="pincode"
                        name="pincode"
                        type="text"
                        inputMode="numeric"
                        maxLength="6"
                        value={formData.pincode}
                        onChange={handleChange}
                        autoComplete="postal-code"
                        placeholder="6-digit PIN code"
                        aria-invalid={!!formErrors.pincode}
                        className={
                          formErrors.pincode
                            ? errorInputClass
                            : inputClass
                        }
                      />

                      {formErrors.pincode && (
                        <p className={errorClass}>
                          {formErrors.pincode}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ================= PAYMENT METHOD ================= */}

              <div className="mt-8 border-t border-nexora-border pt-8">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-nexora-primary text-[11px] font-bold text-white">
                    02
                  </span>

                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-nexora-taupe">
                    Payment
                  </p>
                </div>

                <h2 className="mt-5 text-xl font-black tracking-[-0.025em] text-nexora-text sm:text-2xl">
                  Choose payment method
                </h2>

                <p className="mt-2 text-sm text-nexora-muted">
                  Select how you would like to pay for
                  this order.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() =>
                      setPaymentMethod("razorpay")
                    }
                    className={`rounded-2xl border p-5 text-left transition ${
                      paymentMethod === "razorpay"
                        ? "border-nexora-primary bg-nexora-primary-soft"
                        : "border-nexora-border bg-nexora-ivory hover:border-nexora-taupe"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-nexora-text">
                          Online Payment
                        </p>

                        <p className="mt-2 text-xs leading-5 text-nexora-muted">
                          Pay securely using Razorpay
                          Test Mode.
                        </p>
                      </div>

                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                          paymentMethod === "razorpay"
                            ? "border-nexora-primary bg-nexora-primary"
                            : "border-nexora-taupe"
                        }`}
                      >
                        {paymentMethod === "razorpay" && (
                          <span className="h-2 w-2 rounded-full bg-white" />
                        )}
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setPaymentMethod("cod")
                    }
                    className={`rounded-2xl border p-5 text-left transition ${
                      paymentMethod === "cod"
                        ? "border-nexora-primary bg-nexora-primary-soft"
                        : "border-nexora-border bg-nexora-ivory hover:border-nexora-taupe"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-nexora-text">
                          Cash on Delivery
                        </p>

                        <p className="mt-2 text-xs leading-5 text-nexora-muted">
                          Pay when your order is
                          delivered.
                        </p>
                      </div>

                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                          paymentMethod === "cod"
                            ? "border-nexora-primary bg-nexora-primary"
                            : "border-nexora-taupe"
                        }`}
                      >
                        {paymentMethod === "cod" && (
                          <span className="h-2 w-2 rounded-full bg-white" />
                        )}
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* ================= SUBMIT ================= */}

              <div className="mt-8 border-t border-nexora-border pt-7">
                <button
                  type="submit"
                  disabled={
                    paymentOpening ||
                    loading ||
                    couponLoading
                  }
                  className="group flex w-full items-center justify-between rounded-full bg-nexora-primary px-6 py-4 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-nexora-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="flex items-center gap-3">
                    {(paymentOpening || loading) && (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    )}

                    {loading
                      ? "Processing Order..."
                      : paymentOpening
                        ? paymentMethod === "cod"
                          ? "Placing Order..."
                          : "Preparing Payment..."
                        : paymentMethod === "cod"
                          ? "Place COD Order"
                          : `Pay ₹${total.toLocaleString(
                              "en-IN",
                              {
                                maximumFractionDigits: 2,
                              }
                            )}`}
                  </span>

                  {!paymentOpening && !loading && (
                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  )}
                </button>

                <p className="mt-4 text-center text-[11px] text-nexora-muted">
                  {paymentMethod === "cod"
                    ? "No payment is required now. Payment will be collected on delivery."
                    : "Razorpay Test Mode — no real money will be charged."}
                </p>
              </div>
            </form>
          </section>

          {/* ================= ORDER SUMMARY ================= */}

          <aside className="h-fit lg:sticky lg:top-28">
            <div className="overflow-hidden rounded-[2rem] bg-nexora-primary text-white shadow-[0_25px_60px_rgba(18,63,50,0.18)]">
              <div className="p-6 sm:p-7">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-nexora-taupe-soft/70">
                  Order
                </p>

                <h2 className="mt-3 text-2xl font-black tracking-tight">
                  Order Summary
                </h2>

                <p className="mt-2 text-xs text-white/45">
                  {totalItems}{" "}
                  {totalItems === 1 ? "item" : "items"}{" "}
                  in your order
                </p>

                {/* ================= PRODUCTS ================= */}

                <div className="mt-7 max-h-[330px] space-y-4 overflow-y-auto pr-1">
                  {checkoutItems.map((item) => (
                    <div
                      key={
                        item.variantId
                          ? `${item.id}-${item.variantId}`
                          : item.id
                      }
                      className="flex gap-4 border-b border-white/10 pb-4 last:border-b-0"
                    >
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-nexora-ivory">
                        <img
                          src={item.thumbnail}
                          alt={item.name}
                          loading="lazy"
                          className="h-full w-full object-contain p-2"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="line-clamp-2 text-sm font-semibold">
                          {item.name}
                        </h3>

                        {item.variantLabel && (
                          <div className="mt-2">
                            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-nexora-taupe-soft/60">
                              Configuration
                            </p>

                            <p className="mt-1 text-xs font-semibold text-white/70">
                              {item.variantLabel}
                            </p>
                          </div>
                        )}

                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-white/45">
                            Qty {item.quantity}
                          </span>

                          <span className="text-sm font-bold">
                            ₹
                            {(
                              Number(item.price) *
                              Number(item.quantity)
                            ).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ================= COUPON ================= */}

                <div className="mt-7 border-t border-white/10 pt-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-nexora-taupe-soft/70">
                        Promo Code
                      </p>

                      <p className="mt-1 text-xs text-white/45">
                        Have a NEXORA coupon?
                      </p>
                    </div>

                    {appliedCoupon && (
                      <span className="rounded-full bg-white/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white">
                        Applied
                      </span>
                    )}
                  </div>

                  {!appliedCoupon ? (
                    <div className="mt-4">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={handleCouponChange}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleApplyCoupon();
                            }
                          }}
                          disabled={
                            couponLoading ||
                            paymentOpening ||
                            loading
                          }
                          placeholder="Enter coupon"
                          className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white outline-none transition placeholder:font-normal placeholder:normal-case placeholder:tracking-normal placeholder:text-white/35 focus:border-white/40 focus:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
                        />

                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={
                            couponLoading ||
                            paymentOpening ||
                            loading
                          }
                          className="shrink-0 rounded-xl bg-white px-4 py-3 text-xs font-black text-nexora-primary transition hover:bg-nexora-ivory disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {couponLoading
                            ? "Checking..."
                            : "Apply"}
                        </button>
                      </div>

                      {couponError && (
                        <div className="mt-3 rounded-xl border border-red-300/20 bg-red-500/10 px-3 py-2.5">
                          <p className="text-xs leading-5 text-red-100">
                            {couponError}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-4 rounded-2xl border border-white/15 bg-white/10 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-black text-nexora-primary">
                              ✓
                            </span>

                            <p className="text-sm font-black tracking-wide">
                              {appliedCoupon.code}
                            </p>
                          </div>

                          <p className="mt-2 text-xs leading-5 text-white/55">
                            {appliedCoupon.type ===
                            "percentage"
                              ? `${appliedCoupon.value}% discount applied`
                              : `₹${Number(
                                  appliedCoupon.value
                                ).toLocaleString(
                                  "en-IN"
                                )} discount applied`}

                            {appliedCoupon.type ===
                              "percentage" &&
                              appliedCoupon.maxDiscount !=
                                null &&
                              ` · Max ₹${Number(
                                appliedCoupon.maxDiscount
                              ).toLocaleString(
                                "en-IN"
                              )}`}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          disabled={
                            paymentOpening ||
                            loading
                          }
                          className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/50 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="mt-3 border-t border-white/10 pt-3">
                        <p className="text-xs font-semibold text-emerald-200">
                          You save ₹
                          {discount.toLocaleString(
                            "en-IN",
                            {
                              maximumFractionDigits: 2,
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* ================= TOTALS ================= */}

                <div className="mt-7 space-y-4 border-t border-white/10 pt-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">
                      Subtotal
                    </span>

                    <span className="font-semibold">
                      ₹
                      {subtotal.toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>

                  {appliedCoupon &&
                    discount > 0 && (
                      <div className="flex justify-between gap-4 text-sm">
                        <div>
                          <span className="text-emerald-200">
                            Coupon Discount
                          </span>

                          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/35">
                            {appliedCoupon.code}
                          </p>
                        </div>

                        <span className="font-bold text-emerald-200">
                          -₹
                          {discount.toLocaleString(
                            "en-IN",
                            {
                              maximumFractionDigits: 2,
                            }
                          )}
                        </span>
                      </div>
                    )}

                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">
                      Shipping
                    </span>

                    <span className="font-semibold">
                      Free
                    </span>
                  </div>

                  <div className="h-px bg-white/10" />

                  <div>
                    <p className="text-xs uppercase tracking-[0.15em] text-nexora-taupe-soft/60">
                      Total
                    </p>

                    <p className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
                      ₹
                      {total.toLocaleString(
                        "en-IN",
                        {
                          maximumFractionDigits: 2,
                        }
                      )}
                    </p>

                    {appliedCoupon &&
                      discount > 0 && (
                        <p className="mt-2 text-xs font-medium text-emerald-200">
                          You saved ₹
                          {discount.toLocaleString(
                            "en-IN",
                            {
                              maximumFractionDigits: 2,
                            }
                          )}{" "}
                          with {appliedCoupon.code}
                        </p>
                      )}
                  </div>
                </div>
              </div>
            </div>

            {/* ================= PAYMENT INFO ================= */}

            <div className="mt-4 rounded-[1.75rem] border border-nexora-border bg-nexora-surface p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-nexora-taupe">
                Payment
              </p>

              <div className="mt-4 flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-nexora-primary-soft text-nexora-primary">
                  {paymentMethod === "cod" ? (
                    <span className="text-sm font-black">
                      ₹
                    </span>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <rect
                        x="3"
                        y="6"
                        width="18"
                        height="12"
                        rx="2"
                      />
                      <path d="M3 10h18" />
                    </svg>
                  )}
                </div>

                <div>
                  <p className="text-sm font-bold text-nexora-text">
                    {paymentMethod === "cod"
                      ? "Cash on Delivery"
                      : "Razorpay Test Payment"}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-nexora-muted">
                    {paymentMethod === "cod"
                      ? "Payment will be collected when the order is delivered."
                      : "Online payment is processed through Razorpay Test Mode."}
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
};

export default Checkout;