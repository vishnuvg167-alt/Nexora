import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import OrderTrackingTimeline from "../components/orders/OrderTrackingTimeline";
import OrderProductItem from "../components/orders/OrderProductItem";
import OrderDetailsGrid from "../components/orders/OrderDetailsGrid";
import OrderActions from "../components/orders/OrderActions";
import ReturnRequestDrawer from "../components/orders/ReturnRequestDrawer";
import ReplacementRequestDrawer from "../components/orders/ReplacementRequestDrawer";

import {
  fetchOrders,
  cancelOrderThunk,
} from "../redux/slices/orderSlice";

import {
  fetchUserReturns,
  createReturnRequestThunk,
} from "../redux/slices/returnSlice";

import {
  fetchUserReplacements,
  createReplacementRequestThunk,
} from "../redux/slices/replacementSlice";

const Orders = () => {
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);

  const {
    items,
    loading,
    error,
    cancellingOrderId,
  } = useSelector((state) => state.orders);

  const {
    items: returnRequests,
    creating: creatingReturn,
  } = useSelector((state) => state.returns);

  const {
    items: replacementRequests,
    creating: creatingReplacement,
  } = useSelector((state) => state.replacements);

  /* =====================================================
     LOCAL STATE
  ===================================================== */

  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancelError, setCancelError] = useState("");

  const [orderToReturn, setOrderToReturn] = useState(null);
  const [returnError, setReturnError] = useState("");

  const [orderToReplace, setOrderToReplace] = useState(null);
  const [replacementError, setReplacementError] = useState("");

  /* =====================================================
     FETCH ORDERS + RETURNS + REPLACEMENTS
  ===================================================== */

  useEffect(() => {
    if (!user?.id) return;

    dispatch(fetchOrders(user.id));
    dispatch(fetchUserReturns(user.id));
    dispatch(fetchUserReplacements(user.id));
  }, [dispatch, user?.id]);

  /* =====================================================
     PAYMENT METHOD LABEL
  ===================================================== */

  const getPaymentMethodLabel = (method) => {
    const normalizedMethod = (method || "").toLowerCase();

    if (normalizedMethod === "razorpay") {
      return "Razorpay";
    }

    if (normalizedMethod === "cod") {
      return "Cash on Delivery";
    }

    return "Not available";
  };

  /* =====================================================
     PAYMENT STATUS LABEL
  ===================================================== */

  const getPaymentStatusLabel = (status) => {
    const normalizedStatus = (status || "").toLowerCase();

    if (normalizedStatus === "paid") return "Paid";
    if (normalizedStatus === "pending") return "Pending";
    if (normalizedStatus === "failed") return "Failed";
    if (normalizedStatus === "refunded") return "Refunded";

    return "Not available";
  };

  /* =====================================================
     ORDER STATUS STYLE
  ===================================================== */

  const getOrderStatusStyle = (status) => {
    const normalizedStatus = (status || "placed").toLowerCase();

    if (normalizedStatus === "processing") {
      return {
        wrapper: "border-amber-200 bg-amber-50",
        dot: "bg-amber-500",
        text: "text-amber-700",
      };
    }

    if (normalizedStatus === "shipped") {
      return {
        wrapper: "border-blue-200 bg-blue-50",
        dot: "bg-blue-500",
        text: "text-blue-700",
      };
    }

    if (normalizedStatus === "delivered") {
      return {
        wrapper: "border-emerald-200 bg-emerald-50",
        dot: "bg-emerald-500",
        text: "text-emerald-700",
      };
    }

    if (normalizedStatus === "cancelled") {
      return {
        wrapper: "border-red-200 bg-red-50",
        dot: "bg-red-500",
        text: "text-red-700",
      };
    }

    return {
      wrapper: "border-nexora-primary/15 bg-nexora-primary-soft",
      dot: "bg-nexora-primary",
      text: "text-nexora-primary",
    };
  };

  /* =====================================================
     RETURN STATUS LABEL
  ===================================================== */

  const getReturnStatusLabel = (status) => {
    const normalizedStatus = (status || "requested").toLowerCase();

    if (normalizedStatus === "requested") return "Return Requested";
    if (normalizedStatus === "approved") return "Return Approved";
    if (normalizedStatus === "rejected") return "Return Rejected";
    if (normalizedStatus === "received") return "Return Received";
    if (normalizedStatus === "completed") return "Return Completed";

    return `Return ${normalizedStatus}`;
  };

  /* =====================================================
     REPLACEMENT STATUS LABEL
  ===================================================== */

  const getReplacementStatusLabel = (status) => {
    const normalizedStatus = (status || "requested").toLowerCase();

    if (normalizedStatus === "requested") {
      return "Replacement Requested";
    }

    if (normalizedStatus === "approved") {
      return "Replacement Approved";
    }

    if (normalizedStatus === "rejected") {
      return "Replacement Rejected";
    }

    if (normalizedStatus === "received") {
      return "Original Received";
    }

    if (normalizedStatus === "inspected") {
      return "Inspection Completed";
    }

    if (normalizedStatus === "shipped") {
      return "Replacement Shipped";
    }

    if (normalizedStatus === "delivered") {
      return "Replacement Delivered";
    }

    return `Replacement ${normalizedStatus}`;
  };

  /* =====================================================
     ORDER ITEM KEY
  ===================================================== */

  const getOrderItemKey = (item) => {
    return `${String(item?.id)}::${String(
      item?.variantId || "simple"
    )}`;
  };

  /* =====================================================
     RETURN POLICY
  ===================================================== */

  const hasReturnPolicySnapshot = (item) => {
    return typeof item?.returnEligible === "boolean";
  };

  const isItemReturnEligible = (item) => {
    /*
     * Legacy orders created before return policies existed
     * preserve the original return behaviour.
     */

    if (!hasReturnPolicySnapshot(item)) {
      return true;
    }

    return item.returnEligible === true;
  };

  const getItemReturnWindowDays = (item) => {
    if (!hasReturnPolicySnapshot(item)) {
      return null;
    }

    const days = Number(item.returnWindowDays);

    return Number.isFinite(days) && days > 0 ? days : 0;
  };

  /* =====================================================
     RETURN WINDOW
  ===================================================== */

  const isWithinReturnWindow = (order, item) => {
    if (!hasReturnPolicySnapshot(item)) {
      return true;
    }

    if (!isItemReturnEligible(item)) {
      return false;
    }

    const windowDays = getItemReturnWindowDays(item);

    if (!windowDays) {
      return false;
    }

    if (!order?.deliveredAt) {
      return false;
    }

    const deliveredTime = new Date(order.deliveredAt).getTime();

    if (!Number.isFinite(deliveredTime)) {
      return false;
    }

    const millisecondsPerDay = 24 * 60 * 60 * 1000;

    const returnDeadline =
      deliveredTime + windowDays * millisecondsPerDay;

    return Date.now() <= returnDeadline;
  };

  /* =====================================================
     REPLACEMENT POLICY
  ===================================================== */

  const hasReplacementPolicySnapshot = (item) => {
    return typeof item?.replacementEligible === "boolean";
  };

  const isItemReplacementEligible = (item) => {
    /*
     * Replacement is a new entitlement.
     *
     * Unlike legacy returns, old orders without an explicit
     * replacement policy snapshot do NOT automatically gain
     * replacement eligibility.
     */

    if (!hasReplacementPolicySnapshot(item)) {
      return false;
    }

    return item.replacementEligible === true;
  };

  const getItemReplacementWindowDays = (item) => {
    if (!hasReplacementPolicySnapshot(item)) {
      return 0;
    }

    const days = Number(item.replacementWindowDays);

    return Number.isFinite(days) && days > 0 ? days : 0;
  };

  /* =====================================================
     REPLACEMENT WINDOW
  ===================================================== */

  const isWithinReplacementWindow = (order, item) => {
    if (!isItemReplacementEligible(item)) {
      return false;
    }

    const windowDays = getItemReplacementWindowDays(item);

    if (!windowDays) {
      return false;
    }

    if (!order?.deliveredAt) {
      return false;
    }

    const deliveredTime = new Date(order.deliveredAt).getTime();

    if (!Number.isFinite(deliveredTime)) {
      return false;
    }

    const millisecondsPerDay = 24 * 60 * 60 * 1000;

    const replacementDeadline =
      deliveredTime + windowDays * millisecondsPerDay;

    return Date.now() <= replacementDeadline;
  };

  /* =====================================================
     COMMITTED RETURN QUANTITY
  ===================================================== */

  const getCommittedReturnQuantity = (orderId, itemKey) => {
    const orderReturns = returnRequests.filter(
      (request) => String(request.orderId) === String(orderId)
    );

    return orderReturns.reduce((total, request) => {
      const status = (request.status || "requested").toLowerCase();

      /*
       * Rejected requests release the quantity.
       */

      if (status === "rejected") {
        return total;
      }

      const requestItems = Array.isArray(request.items)
        ? request.items
        : [];

      const quantity = requestItems.reduce(
        (itemTotal, requestItem) => {
          if (getOrderItemKey(requestItem) !== itemKey) {
            return itemTotal;
          }

          return itemTotal + Number(requestItem.quantity || 0);
        },
        0
      );

      return total + quantity;
    }, 0);
  };

  /* =====================================================
     COMMITTED REPLACEMENT QUANTITY
  ===================================================== */

  const getCommittedReplacementQuantity = (
    orderId,
    itemKey
  ) => {
    const orderReplacements = replacementRequests.filter(
      (request) => String(request.orderId) === String(orderId)
    );

    return orderReplacements.reduce((total, request) => {
      const status = (request.status || "requested").toLowerCase();

      /*
       * Rejected replacements release the purchased quantity.
       */

      if (status === "rejected") {
        return total;
      }

      const requestItems = Array.isArray(request.items)
        ? request.items
        : [];

      const quantity = requestItems.reduce(
        (itemTotal, requestItem) => {
          if (getOrderItemKey(requestItem) !== itemKey) {
            return itemTotal;
          }

          return itemTotal + Number(requestItem.quantity || 0);
        },
        0
      );

      return total + quantity;
    }, 0);
  };

  /* =====================================================
     RETURNABLE ITEMS

     A purchased unit can be used for either:
     - a return
     - a replacement

     but not both.
  ===================================================== */

  const getReturnableItems = (order) => {
    const orderItems = Array.isArray(order?.items) ? order.items : [];

    if ((order?.status || "").toLowerCase() !== "delivered") {
      return [];
    }

    return orderItems
      .map((item) => {
        const purchasedQuantity = Number(item.quantity) || 0;

        const returnPolicyEligible = isItemReturnEligible(item);
        const withinReturnWindow = isWithinReturnWindow(order, item);

        if (!returnPolicyEligible || !withinReturnWindow) {
          return {
            ...item,
            returnableQuantity: 0,
            returnPolicyEligible,
            withinReturnWindow,
            returnWindowDays: getItemReturnWindowDays(item),
          };
        }

        const itemKey = getOrderItemKey(item);

        const committedReturns =
          getCommittedReturnQuantity(order.id, itemKey);

        const committedReplacements =
          getCommittedReplacementQuantity(order.id, itemKey);

        const committedQuantity =
          committedReturns + committedReplacements;

        const returnableQuantity = Math.max(
          0,
          purchasedQuantity - committedQuantity
        );

        return {
          ...item,
          returnableQuantity,
          returnPolicyEligible: true,
          withinReturnWindow: true,
          returnWindowDays: getItemReturnWindowDays(item),
        };
      })
      .filter((item) => item.returnableQuantity > 0);
  };

  /* =====================================================
     REPLACEABLE ITEMS
  ===================================================== */

  const getReplaceableItems = (order) => {
    const orderItems = Array.isArray(order?.items) ? order.items : [];

    if ((order?.status || "").toLowerCase() !== "delivered") {
      return [];
    }

    return orderItems
      .map((item) => {
        const purchasedQuantity = Number(item.quantity) || 0;

        const replacementPolicyEligible =
          isItemReplacementEligible(item);

        const withinReplacementWindow =
          isWithinReplacementWindow(order, item);

        if (
          !replacementPolicyEligible ||
          !withinReplacementWindow
        ) {
          return {
            ...item,
            replaceableQuantity: 0,
            replacementPolicyEligible,
            withinReplacementWindow,
            replacementWindowDays:
              getItemReplacementWindowDays(item),
          };
        }

        const itemKey = getOrderItemKey(item);

        const committedReturns =
          getCommittedReturnQuantity(order.id, itemKey);

        const committedReplacements =
          getCommittedReplacementQuantity(order.id, itemKey);

        const committedQuantity =
          committedReturns + committedReplacements;

        const replaceableQuantity = Math.max(
          0,
          purchasedQuantity - committedQuantity
        );

        return {
          ...item,
          replaceableQuantity,
          replacementPolicyEligible: true,
          withinReplacementWindow: true,
          replacementWindowDays:
            getItemReplacementWindowDays(item),
        };
      })
      .filter((item) => item.replaceableQuantity > 0);
  };

  /* =====================================================
     GET RETURNABLE QUANTITY
  ===================================================== */

  const getReturnableQuantity = (item) => {
    if (!orderToReturn) return 0;

    const eligibleItems = getReturnableItems(orderToReturn);
    const itemKey = getOrderItemKey(item);

    const eligibleItem = eligibleItems.find(
      (candidate) => getOrderItemKey(candidate) === itemKey
    );

    return Number(eligibleItem?.returnableQuantity || 0);
  };

  /* =====================================================
     OPEN / CLOSE CANCELLATION
  ===================================================== */

  const handleOpenCancel = (order) => {
    setCancelError("");
    setOrderToCancel(order);
  };

  const handleCloseCancel = () => {
    if (cancellingOrderId) return;

    setOrderToCancel(null);
    setCancelError("");
  };

  /* =====================================================
     CONFIRM CANCELLATION
  ===================================================== */

  const handleConfirmCancel = async () => {
    if (!orderToCancel) return;

    setCancelError("");

    try {
      await dispatch(cancelOrderThunk(orderToCancel)).unwrap();

      setOrderToCancel(null);
    } catch (error) {
      setCancelError(
        typeof error === "string"
          ? error
          : error?.message || "Failed to cancel order."
      );
    }
  };

  /* =====================================================
     OPEN / CLOSE RETURN
  ===================================================== */

  const handleOpenReturn = (order) => {
    const status = (order?.status || "").toLowerCase();

    if (status !== "delivered") return;

    const eligibleItems = getReturnableItems(order);

    if (eligibleItems.length === 0) {
      setReturnError(
        "There are no products currently eligible for return."
      );

      return;
    }

    setReturnError("");
    setOrderToReturn(order);
  };

  const handleCloseReturn = () => {
    if (creatingReturn) return;

    setOrderToReturn(null);
    setReturnError("");
  };

  /* =====================================================
     OPEN / CLOSE REPLACEMENT
  ===================================================== */

  const handleOpenReplacement = (order) => {
    const status = (order?.status || "").toLowerCase();

    if (status !== "delivered") {
      return;
    }

    const eligibleItems = getReplaceableItems(order);

    if (eligibleItems.length === 0) {
      setReplacementError(
        "There are no products currently eligible for replacement."
      );

      return;
    }

    setReplacementError("");
    setOrderToReplace(order);
  };

  const handleCloseReplacement = () => {
    if (creatingReplacement) return;

    setOrderToReplace(null);
    setReplacementError("");
  };

  /* =====================================================
     SUBMIT RETURN REQUEST
  ===================================================== */

  const handleSubmitReturn = async ({
    items: selectedItems,
    reason,
    details,
  }) => {
    if (!orderToReturn || !user?.id) {
      throw new Error("Unable to create return request.");
    }

    /* ================= OWNERSHIP ================= */

    if (String(orderToReturn.userId) !== String(user.id)) {
      throw new Error("You cannot return this order.");
    }

    /* ================= DELIVERED ================= */

    if ((orderToReturn.status || "").toLowerCase() !== "delivered") {
      throw new Error("Only delivered orders can be returned.");
    }

    /* ================= ITEMS ================= */

    if (!Array.isArray(selectedItems) || selectedItems.length === 0) {
      throw new Error(
        "Please select at least one product to return."
      );
    }

    const orderItems = Array.isArray(orderToReturn.items)
      ? orderToReturn.items
      : [];

    /*
     * Recalculate immediately before submission.
     *
     * This protects against stale drawer state.
     */

    const eligibleItems = getReturnableItems(orderToReturn);

    const validatedItems = [];

    for (const selectedItem of selectedItems) {
      const selectedKey = getOrderItemKey(selectedItem);

      const originalOrderItem = orderItems.find(
        (item) => getOrderItemKey(item) === selectedKey
      );

      if (!originalOrderItem) {
        throw new Error(
          `${
            selectedItem.name || "Selected product"
          } does not belong to this order.`
        );
      }

      if (!isItemReturnEligible(originalOrderItem)) {
        throw new Error(
          `${
            originalOrderItem.name || "Selected product"
          } is not eligible for return.`
        );
      }

      if (!isWithinReturnWindow(orderToReturn, originalOrderItem)) {
        throw new Error(
          `The return window for ${
            originalOrderItem.name || "this product"
          } has expired.`
        );
      }

      const eligibleItem = eligibleItems.find(
        (item) => getOrderItemKey(item) === selectedKey
      );

      if (!eligibleItem) {
        throw new Error(
          `${
            selectedItem.name || "Selected product"
          } is no longer eligible for return.`
        );
      }

      const requestedQuantity = Number(selectedItem.quantity);

      const availableQuantity =
        Number(eligibleItem.returnableQuantity) || 0;

      if (
        !Number.isInteger(requestedQuantity) ||
        requestedQuantity < 1
      ) {
        throw new Error(
          `Invalid return quantity for ${eligibleItem.name}.`
        );
      }

      if (requestedQuantity > availableQuantity) {
        throw new Error(
          `Only ${availableQuantity} ${
            availableQuantity === 1 ? "unit is" : "units are"
          } currently returnable for ${eligibleItem.name}.`
        );
      }

      validatedItems.push({
        id: eligibleItem.id,
        name: eligibleItem.name,
        brand: eligibleItem.brand || "NEXORA",
        price: Number(eligibleItem.price) || 0,
        quantity: requestedQuantity,
        thumbnail: eligibleItem.thumbnail || "",
        variantId: eligibleItem.variantId || null,
        variantLabel: eligibleItem.variantLabel || null,
        variantAttributes: eligibleItem.variantAttributes || null,

        returnEligible: isItemReturnEligible(originalOrderItem),

        returnWindowDays:
          getItemReturnWindowDays(originalOrderItem),
      });
    }

    /* ================= REASON ================= */

    if (!reason) {
      throw new Error("Please select a return reason.");
    }

    const cleanDetails = details?.trim() || "";

    if (reason === "other" && cleanDetails.length < 10) {
      throw new Error(
        "Please provide at least 10 characters explaining the return."
      );
    }

    setReturnError("");

    /* ================= PAYLOAD ================= */

    const returnData = {
      userId: user.id,
      orderId: orderToReturn.id,
      items: validatedItems,
      reason,
      details: cleanDetails,
      status: "requested",
      refundStatus: "not_started",
      createdAt: new Date().toISOString(),
    };

    try {
      await dispatch(
        createReturnRequestThunk(returnData)
      ).unwrap();

      await dispatch(fetchUserReturns(user.id)).unwrap();

      setOrderToReturn(null);
      setReturnError("");
    } catch (error) {
      const message =
        typeof error === "string"
          ? error
          : error?.message ||
            "Failed to submit return request.";

      setReturnError(message);

      throw new Error(message);
    }
  };

  /* =====================================================
     SUBMIT REPLACEMENT REQUEST
  ===================================================== */

  const handleSubmitReplacement = async ({
    items: selectedItems,
    reason,
    details,
  }) => {
    if (!orderToReplace || !user?.id) {
      throw new Error(
        "Unable to create replacement request."
      );
    }

    /* ================= OWNERSHIP ================= */

    if (String(orderToReplace.userId) !== String(user.id)) {
      throw new Error(
        "You cannot request a replacement for this order."
      );
    }

    /* ================= DELIVERED ================= */

    if ((orderToReplace.status || "").toLowerCase() !== "delivered") {
      throw new Error(
        "Only delivered orders can be replaced."
      );
    }

    /* ================= ITEMS ================= */

    if (!Array.isArray(selectedItems) || selectedItems.length === 0) {
      throw new Error(
        "Please select at least one product for replacement."
      );
    }

    const orderItems = Array.isArray(orderToReplace.items)
      ? orderToReplace.items
      : [];

    /*
     * Recalculate availability immediately before
     * creating the request.
     */

    const eligibleItems = getReplaceableItems(orderToReplace);

    const validatedItems = [];

    for (const selectedItem of selectedItems) {
      const selectedKey = getOrderItemKey(selectedItem);

      /* ================= ORIGINAL ITEM ================= */

      const originalOrderItem = orderItems.find(
        (item) => getOrderItemKey(item) === selectedKey
      );

      if (!originalOrderItem) {
        throw new Error(
          `${
            selectedItem.name || "Selected product"
          } does not belong to this order.`
        );
      }

      /* ================= POLICY ================= */

      if (!isItemReplacementEligible(originalOrderItem)) {
        throw new Error(
          `${
            originalOrderItem.name || "Selected product"
          } is not eligible for replacement.`
        );
      }

      /* ================= WINDOW ================= */

      if (
        !isWithinReplacementWindow(
          orderToReplace,
          originalOrderItem
        )
      ) {
        throw new Error(
          `The replacement window for ${
            originalOrderItem.name || "this product"
          } has expired.`
        );
      }

      /* ================= CURRENT AVAILABILITY ================= */

      const eligibleItem = eligibleItems.find(
        (item) => getOrderItemKey(item) === selectedKey
      );

      if (!eligibleItem) {
        throw new Error(
          `${
            selectedItem.name || "Selected product"
          } is no longer eligible for replacement.`
        );
      }

      /* ================= QUANTITY ================= */

      const requestedQuantity = Number(selectedItem.quantity);

      const availableQuantity =
        Number(eligibleItem.replaceableQuantity) || 0;

      if (
        !Number.isInteger(requestedQuantity) ||
        requestedQuantity < 1
      ) {
        throw new Error(
          `Invalid replacement quantity for ${eligibleItem.name}.`
        );
      }

      if (requestedQuantity > availableQuantity) {
        throw new Error(
          `Only ${availableQuantity} ${
            availableQuantity === 1 ? "unit is" : "units are"
          } currently available for replacement for ${
            eligibleItem.name
          }.`
        );
      }

      /* ================= SNAPSHOT ================= */

      validatedItems.push({
        id: eligibleItem.id,
        name: eligibleItem.name,
        brand: eligibleItem.brand || "NEXORA",
        price: Number(eligibleItem.price) || 0,
        quantity: requestedQuantity,
        thumbnail: eligibleItem.thumbnail || "",

        /*
         * Same exact purchased variant.
         */

        variantId: eligibleItem.variantId || null,
        variantLabel: eligibleItem.variantLabel || null,
        variantAttributes: eligibleItem.variantAttributes || null,

        replacementEligible: true,

        replacementWindowDays:
          getItemReplacementWindowDays(originalOrderItem),
      });
    }

    /* ================= REASON ================= */

    if (!reason) {
      throw new Error(
        "Please select a replacement reason."
      );
    }

    const cleanDetails = details?.trim() || "";

    if (reason === "other" && cleanDetails.length < 10) {
      throw new Error(
        "Please provide at least 10 characters explaining the replacement."
      );
    }

    setReplacementError("");

    /* ================= PAYLOAD ================= */

    const replacementData = {
      userId: user.id,
      orderId: orderToReplace.id,

      items: validatedItems,

      reason,
      details: cleanDetails,

      status: "requested",

      inspectionResult: null,
      inspectionNote: "",

      /*
       * Inventory safety flags.
       */

      stockRestored: false,
      replacementStockDeducted: false,

      requestedAt: new Date().toISOString(),

      approvedAt: null,
      receivedAt: null,
      inspectedAt: null,
      shippedAt: null,
      deliveredAt: null,
    };

    try {
      await dispatch(
        createReplacementRequestThunk(replacementData)
      ).unwrap();

      await dispatch(
        fetchUserReplacements(user.id)
      ).unwrap();

      /*
       * Refresh returns too because return availability
       * shares the same purchased quantity.
       */

      await dispatch(fetchUserReturns(user.id)).unwrap();

      setOrderToReplace(null);
      setReplacementError("");
    } catch (error) {
      const message =
        typeof error === "string"
          ? error
          : error?.message ||
            "Failed to submit replacement request.";

      setReplacementError(message);

      throw new Error(message);
    }
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <main className="min-h-screen bg-nexora-ivory">
        <OrdersHeroSkeleton />

        <section className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="space-y-7">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-[2rem] border border-nexora-border bg-nexora-surface p-6 sm:p-8"
              >
                <div className="grid gap-5 sm:grid-cols-3">
                  {[1, 2, 3].map((box) => (
                    <div key={box}>
                      <div className="h-3 w-20 animate-pulse rounded-full bg-nexora-taupe-soft" />

                      <div className="mt-3 h-5 w-32 animate-pulse rounded-full bg-nexora-primary-soft" />
                    </div>
                  ))}
                </div>

                <div className="mt-8 h-36 animate-pulse rounded-[1.5rem] bg-nexora-ivory" />

                <div className="mt-5 h-36 animate-pulse rounded-[1.5rem] bg-nexora-ivory" />
              </div>
            ))}
          </div>
        </section>
      </main>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error) {
    return (
      <main className="min-h-screen bg-nexora-ivory px-4 py-16 sm:px-6">
        <div className="mx-auto flex min-h-[65vh] max-w-3xl items-center justify-center">
          <div className="w-full rounded-[2rem] border border-red-200 bg-nexora-surface px-6 py-16 text-center shadow-[0_24px_70px_rgba(18,63,50,0.06)] sm:px-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="h-6 w-6 text-red-500"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <path strokeLinecap="round" d="M12 7v6M12 17h.01" />
              </svg>
            </div>

            <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.3em] text-red-500">
              Order Error
            </p>

            <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] text-nexora-text sm:text-5xl">
              Unable to load orders.
            </h1>

            <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-nexora-muted">
              We couldn't retrieve your order history. Please try
              again later.
            </p>

            <p className="mx-auto mt-4 max-w-md text-xs text-red-500">
              {error}
            </p>

            <Link
              to="/products"
              className="group mt-8 inline-flex items-center gap-3 rounded-full bg-nexora-primary px-7 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-nexora-primary-hover"
            >
              Back to Products

              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /* =====================================================
     EMPTY
  ===================================================== */

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-nexora-ivory px-4 py-16 sm:px-6">
        <div className="mx-auto flex min-h-[65vh] max-w-3xl items-center justify-center">
          <div className="w-full rounded-[2rem] border border-nexora-border bg-nexora-surface px-6 py-16 text-center shadow-[0_24px_70px_rgba(18,63,50,0.06)] sm:px-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-nexora-primary-soft text-nexora-primary">
              <PackageIcon />
            </div>

            <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.3em] text-nexora-taupe">
              NEXORA / ORDERS
            </p>

            <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] text-nexora-text sm:text-5xl">
              No orders yet.
            </h1>

            <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-nexora-muted">
              Your NEXORA purchases will appear here after you place
              your first order.
            </p>

            <Link
              to="/products"
              className="group mt-8 inline-flex items-center gap-3 rounded-full bg-nexora-primary px-7 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-nexora-primary-hover"
            >
              Start Shopping

              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /* =====================================================
     SORT ORDERS
  ===================================================== */

  const sortedOrders = [...items].sort((a, b) => {
    const dateA = a.createdAt
      ? new Date(a.createdAt).getTime()
      : 0;

    const dateB = b.createdAt
      ? new Date(b.createdAt).getTime()
      : 0;

    return dateB - dateA;
  });

  const deliveredOrders = items.filter(
    (order) =>
      (order.status || "").toLowerCase() === "delivered"
  ).length;

  const activeOrders = items.filter((order) =>
    ["placed", "processing", "shipped"].includes(
      (order.status || "").toLowerCase()
    )
  ).length;

  /* =====================================================
     ORDERS
  ===================================================== */

  return (
    <main className="min-h-screen bg-nexora-ivory">
      {/* =================================================
          PREMIUM HERO
      ================================================= */}

      <section className="relative overflow-hidden border-b border-nexora-border bg-nexora-primary">
        <div className="pointer-events-none absolute -right-32 -top-44 h-[430px] w-[430px] rounded-full border border-white/[0.06]" />

        <div className="pointer-events-none absolute -right-12 -top-20 h-[280px] w-[280px] rounded-full border border-white/[0.06]" />

        <div className="pointer-events-none absolute bottom-0 left-[45%] h-px w-72 bg-gradient-to-r from-transparent via-nexora-copper/60 to-transparent" />

        <div className="relative mx-auto max-w-[1440px] px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-9 bg-nexora-copper" />

                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
                  NEXORA / PURCHASE HISTORY
                </p>
              </div>

              <h1 className="mt-5 text-4xl font-black leading-[0.95] tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
                Your purchases,

                <span className="block text-white/45">
                  beautifully organised.
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-sm leading-6 text-white/55">
                Track deliveries, review payment details and manage
                returns or replacements from one place.
              </p>
            </div>

            <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-sm">
              <HeroStat label="Orders" value={items.length} />

              <HeroStat
                label="Active"
                value={activeOrders}
                border
              />

              <HeroStat
                label="Delivered"
                value={deliveredOrders}
                border
              />
            </div>
          </div>
        </div>
      </section>

      {/* =================================================
          TOOLBAR
      ================================================= */}

      <section className="border-b border-nexora-border bg-nexora-surface">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-nexora-taupe">
              Purchase history
            </p>

            <p className="mt-1 text-sm font-bold text-nexora-text">
              {items.length}{" "}
              {items.length === 1 ? "order" : "orders"} in your
              account
            </p>
          </div>

          <div className="flex items-center gap-5">
            <Link
              to="/account"
              className="text-xs font-bold text-nexora-muted transition hover:text-nexora-primary"
            >
              My Account
            </Link>

            <Link
              to="/products"
              className="group inline-flex items-center gap-2 rounded-full bg-nexora-primary-soft px-4 py-2.5 text-xs font-bold text-nexora-primary transition hover:bg-nexora-primary hover:text-white"
            >
              Continue Shopping

              <span className="transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* =================================================
          ORDER LIST
      ================================================= */}

      <section className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="space-y-8">
          {sortedOrders.map((order, orderIndex) => {
            const orderItems = Array.isArray(order.items)
              ? order.items
              : [];

            const orderItemCount = orderItems.reduce(
              (total, item) =>
                total + Number(item.quantity || 0),
              0
            );

            const formattedDate = order.createdAt
              ? new Date(order.createdAt).toLocaleDateString(
                  "en-IN",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }
                )
              : "Not available";

            const orderStatus = (
              order.status || "placed"
            ).toLowerCase();

            /* ================= RETURNS ================= */

            const orderReturnRequests = returnRequests.filter(
              (request) =>
                String(request.orderId) === String(order.id)
            );

            const latestReturn =
              [...orderReturnRequests].sort((a, b) => {
                const dateA = a.createdAt
                  ? new Date(a.createdAt).getTime()
                  : 0;

                const dateB = b.createdAt
                  ? new Date(b.createdAt).getTime()
                  : 0;

                return dateB - dateA;
              })[0] || null;

            const returnableItems = getReturnableItems(order);

            const canRequestReturn =
              orderStatus === "delivered" &&
              returnableItems.length > 0;

            /* ================= REPLACEMENTS ================= */

            const orderReplacementRequests =
              replacementRequests.filter(
                (request) =>
                  String(request.orderId) === String(order.id)
              );

            const latestReplacement =
              [...orderReplacementRequests].sort((a, b) => {
                const dateA = a.requestedAt
                  ? new Date(a.requestedAt).getTime()
                  : a.createdAt
                    ? new Date(a.createdAt).getTime()
                    : 0;

                const dateB = b.requestedAt
                  ? new Date(b.requestedAt).getTime()
                  : b.createdAt
                    ? new Date(b.createdAt).getTime()
                    : 0;

                return dateB - dateA;
              })[0] || null;

            const replaceableItems = getReplaceableItems(order);

            const canRequestReplacement =
              orderStatus === "delivered" &&
              replaceableItems.length > 0;

            /* ================= ORDER ACTIONS ================= */

            const canCancel = [
              "placed",
              "processing",
            ].includes(orderStatus);

            const isCancelling =
              String(cancellingOrderId) === String(order.id);

            const statusStyle =
              getOrderStatusStyle(orderStatus);

            const paymentMethodLabel =
              getPaymentMethodLabel(order.paymentMethod);

            const paymentStatusLabel =
              getPaymentStatusLabel(order.paymentStatus);

            return (
              <article
                key={order.id}
                className="group/order overflow-hidden rounded-[2rem] border border-nexora-border bg-nexora-surface shadow-[0_10px_35px_rgba(18,63,50,0.035)] transition-all duration-300 hover:border-nexora-taupe/60 hover:shadow-[0_24px_65px_rgba(18,63,50,0.075)]"
              >
                {/* =============================================
                    ORDER HEADER
                ============================================= */}

                <div className="relative border-b border-nexora-border px-5 py-6 sm:px-7 lg:px-8">
                  <div className="absolute left-0 top-0 h-full w-1 bg-nexora-primary opacity-0 transition-opacity duration-300 group-hover/order:opacity-100" />

                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-nexora-primary-soft text-nexora-primary">
                          <PackageIcon />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-nexora-taupe">
                              Order
                            </p>

                            {orderIndex === 0 && (
                              <span className="rounded-full bg-nexora-copper-soft px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.12em] text-nexora-copper">
                                Latest
                              </span>
                            )}
                          </div>

                          <p className="mt-1.5 max-w-[260px] truncate font-mono text-xs font-bold text-nexora-primary sm:max-w-[320px]">
                            #{order.id}
                          </p>
                        </div>
                      </div>

                      <div className="hidden h-9 w-px bg-nexora-border sm:block" />

                      <OrderMeta
                        label="Placed"
                        value={formattedDate}
                      />

                      <div className="hidden h-9 w-px bg-nexora-border sm:block" />

                      <OrderMeta
                        label="Items"
                        value={`${orderItemCount} ${
                          orderItemCount === 1
                            ? "item"
                            : "items"
                        }`}
                      />
                    </div>

                    <div
                      className={`flex w-fit items-center gap-2 rounded-full border px-4 py-2 ${statusStyle.wrapper}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}
                      />

                      <span
                        className={`text-[10px] font-bold uppercase tracking-[0.14em] ${statusStyle.text}`}
                      >
                        {orderStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* =============================================
                    PRODUCTS
                ============================================= */}

                <div className="px-5 py-6 sm:px-7 sm:py-7 lg:px-8">
                  <SectionHeading
                    eyebrow="Purchased items"
                    title={`${orderItemCount} ${
                      orderItemCount === 1 ? "unit" : "units"
                    } in this order`}
                  />

                  <div className="mt-5 space-y-3">
                    {orderItems.map((item, index) => (
                      <OrderProductItem
                        key={`${item.id}-${
                          item.variantId || "simple"
                        }-${index}`}
                        item={item}
                      />
                    ))}
                  </div>
                </div>

                {/* =============================================
                    TRACKING
                ============================================= */}

                <div className="border-t border-nexora-border bg-nexora-ivory/30 px-5 py-6 sm:px-7 lg:px-8">
                  <OrderTrackingTimeline status={orderStatus} />
                </div>

                {/* =============================================
                    DETAILS
                ============================================= */}

                <div className="border-t border-nexora-border px-5 py-6 sm:px-7 sm:py-7 lg:px-8">
                  <OrderDetailsGrid
                    order={order}
                    paymentMethodLabel={paymentMethodLabel}
                    paymentStatusLabel={paymentStatusLabel}
                  />

                  <div className="mt-4">
                    <OrderActions
                      order={order}
                      latestReturn={latestReturn}
                      latestReplacement={latestReplacement}
                      returnableItems={returnableItems}
                      replaceableItems={replaceableItems}
                      canCancel={canCancel}
                      canRequestReturn={canRequestReturn}
                      canRequestReplacement={
                        canRequestReplacement
                      }
                      isCancelling={isCancelling}
                      getReturnStatusLabel={
                        getReturnStatusLabel
                      }
                      getReplacementStatusLabel={
                        getReplacementStatusLabel
                      }
                      onCancel={handleOpenCancel}
                      onReturn={handleOpenReturn}
                      onReplacement={
                        handleOpenReplacement
                      }
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* =================================================
          CANCELLATION MODAL
      ================================================= */}

      {orderToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close cancellation confirmation"
            onClick={handleCloseCancel}
            className="absolute inset-0 h-full w-full cursor-default bg-black/45 backdrop-blur-[3px]"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-order-title"
            className="relative z-10 w-full max-w-md overflow-hidden rounded-[2rem] border border-nexora-border bg-nexora-surface shadow-2xl"
          >
            <div className="h-1 bg-red-500" />

            <div className="p-6 sm:p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 6 6 18M6 6l12 12"
                  />
                </svg>
              </div>

              <p className="mt-6 text-[9px] font-bold uppercase tracking-[0.22em] text-red-500">
                Cancel Order
              </p>

              <h2
                id="cancel-order-title"
                className="mt-2 text-2xl font-black tracking-[-0.035em] text-nexora-text"
              >
                Cancel this order?
              </h2>

              <p className="mt-3 text-sm leading-6 text-nexora-muted">
                You're about to cancel order{" "}
                <span className="font-bold text-nexora-text">
                  #{orderToCancel.id}
                </span>
                . The purchased quantities will be returned to
                inventory.
              </p>

              {(orderToCancel.paymentMethod || "").toLowerCase() ===
                "razorpay" &&
                (
                  orderToCancel.paymentStatus || ""
                ).toLowerCase() === "paid" && (
                  <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-xs font-bold text-amber-800">
                      Paid online order
                    </p>

                    <p className="mt-1 text-xs leading-5 text-amber-700">
                      Cancelling this order does not automatically
                      process a Razorpay refund in this frontend demo.
                    </p>
                  </div>
                )}

              {cancelError && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-xs font-semibold text-red-700">
                    {cancelError}
                  </p>
                </div>
              )}

              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCloseCancel}
                  disabled={Boolean(cancellingOrderId)}
                  className="rounded-full border border-nexora-border bg-nexora-surface px-5 py-2.5 text-sm font-bold text-nexora-text transition hover:border-nexora-taupe hover:bg-nexora-ivory disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Keep Order
                </button>

                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  disabled={Boolean(cancellingOrderId)}
                  className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {cancellingOrderId
                    ? "Cancelling..."
                    : "Yes, Cancel Order"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          RETURN REQUEST DRAWER
      ================================================= */}

      <ReturnRequestDrawer
        isOpen={Boolean(orderToReturn)}
        order={orderToReturn}
        getReturnableQuantity={getReturnableQuantity}
        isSubmitting={creatingReturn}
        onSubmit={handleSubmitReturn}
        onClose={handleCloseReturn}
      />

      {/* =================================================
          REPLACEMENT REQUEST DRAWER
      ================================================= */}

      <ReplacementRequestDrawer
        isOpen={Boolean(orderToReplace)}
        order={orderToReplace}
        items={
          orderToReplace
            ? getReplaceableItems(orderToReplace)
            : []
        }
        isSubmitting={creatingReplacement}
        error={replacementError}
        onSubmit={handleSubmitReplacement}
        onClose={handleCloseReplacement}
      />

      {/* =================================================
          RETURN ERROR
      ================================================= */}

      {orderToReturn && returnError && (
        <div className="fixed bottom-5 right-5 z-[90] max-w-sm rounded-xl border border-red-200 bg-red-50 px-4 py-3 shadow-lg">
          <p className="text-xs font-semibold text-red-700">
            {returnError}
          </p>
        </div>
      )}
    </main>
  );
};

/* =====================================================
   HERO STAT
===================================================== */

const HeroStat = ({ label, value, border = false }) => {
  return (
    <div
      className={`min-w-24 px-5 py-4 text-center sm:min-w-28 sm:px-6 ${
        border ? "border-l border-white/10" : ""
      }`}
    >
      <p className="text-2xl font-black tracking-[-0.04em] text-white">
        {value}
      </p>

      <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.18em] text-white/40">
        {label}
      </p>
    </div>
  );
};

/* =====================================================
   ORDER META
===================================================== */

const OrderMeta = ({ label, value }) => {
  return (
    <div>
      <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-nexora-taupe">
        {label}
      </p>

      <p className="mt-1.5 text-xs font-bold text-nexora-text">
        {value}
      </p>
    </div>
  );
};

/* =====================================================
   SECTION HEADING
===================================================== */

const SectionHeading = ({ eyebrow, title }) => {
  return (
    <div>
      <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-nexora-taupe">
        {eyebrow}
      </p>

      <p className="mt-1 text-sm font-bold text-nexora-text">
        {title}
      </p>
    </div>
  );
};

/* =====================================================
   PACKAGE ICON
===================================================== */

const PackageIcon = () => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m4 7.5 8 4.5 8-4.5M12 12v9"
      />
    </svg>
  );
};

/* =====================================================
   HERO SKELETON
===================================================== */

const OrdersHeroSkeleton = () => {
  return (
    <section className="bg-nexora-primary">
      <div className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-8">
        <div className="h-3 w-40 animate-pulse rounded-full bg-white/10" />

        <div className="mt-6 h-12 w-96 max-w-full animate-pulse rounded-xl bg-white/10" />

        <div className="mt-4 h-4 w-72 max-w-full animate-pulse rounded-full bg-white/10" />
      </div>
    </section>
  );
};

export default Orders;