import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import {
  createReturnRequest,
  getReturnsByUserId,
  getAllReturns,
  updateReturnStatus,
  updateReturnRequest,
} from "../../services/returnService";

import {
  getProductById,
  updateProductStock,
  updateProductVariants,
} from "../../services/productService";

/* =====================================================
   INITIAL STATE
===================================================== */

const initialState = {
  items: [],
  loading: false,
  error: null,
  creating: false,
  updatingReturnId: null,
  updatingRefundId: null,
  inspectingReturnId: null,
  editingInspectionId: null,
};

/* =====================================================
   GENERAL HELPERS
===================================================== */

const roundMoney = (value) => {
  return (
    Math.round(
      (Number(value) + Number.EPSILON) * 100
    ) / 100
  );
};

/*
 * Product + variant represents one purchasable item.
 *
 * Simple:
 * product-1::simple
 *
 * Variant:
 * product-1::1-32-1tb
 */

const getReturnItemKey = (item) => {
  return `${String(item?.id)}::${String(
    item?.variantId || "simple"
  )}`;
};

/* =====================================================
   CREATE RETURN REQUEST
===================================================== */

export const createReturnRequestThunk =
  createAsyncThunk(
    "returns/createReturnRequest",

    async (
      returnData,
      { rejectWithValue }
    ) => {
      try {
        if (!returnData?.userId) {
          throw new Error(
            "User ID is required."
          );
        }

        if (!returnData?.orderId) {
          throw new Error(
            "Order ID is required."
          );
        }

        const items =
          Array.isArray(
            returnData.items
          )
            ? returnData.items
            : [];

        if (items.length === 0) {
          throw new Error(
            "At least one product must be selected for return."
          );
        }

        for (const item of items) {
          if (!item?.id) {
            throw new Error(
              "A returned product is missing its product ID."
            );
          }

          const quantity =
            Number(item.quantity);

          if (
            !Number.isInteger(
              quantity
            ) ||
            quantity <= 0
          ) {
            throw new Error(
              `Invalid return quantity for ${
                item.name ||
                "product"
              }.`
            );
          }

          const price =
            Number(item.price);

          if (
            !Number.isFinite(
              price
            ) ||
            price < 0
          ) {
            throw new Error(
              `Invalid product price for ${
                item.name ||
                "product"
              }.`
            );
          }
        }

        const createdReturn =
          await createReturnRequest(
            returnData
          );

        return createdReturn;
      } catch (error) {
        return rejectWithValue(
          error.response?.data
            ?.message ||
            error.message ||
            "Failed to create return request."
        );
      }
    }
  );

/* =====================================================
   FETCH USER RETURNS
===================================================== */

export const fetchUserReturns =
  createAsyncThunk(
    "returns/fetchUserReturns",

    async (
      userId,
      { rejectWithValue }
    ) => {
      try {
        return await getReturnsByUserId(
          userId
        );
      } catch (error) {
        return rejectWithValue(
          error.response?.data
            ?.message ||
            error.message ||
            "Failed to fetch return requests."
        );
      }
    }
  );

/* =====================================================
   FETCH ALL RETURNS
===================================================== */

export const fetchAllReturns =
  createAsyncThunk(
    "returns/fetchAllReturns",

    async (
      _,
      { rejectWithValue }
    ) => {
      try {
        return await getAllReturns();
      } catch (error) {
        return rejectWithValue(
          error.response?.data
            ?.message ||
            error.message ||
            "Failed to fetch returns."
        );
      }
    }
  );

/* =====================================================
   UPDATE RETURN STATUS
===================================================== */

export const updateReturnStatusThunk =
  createAsyncThunk(
    "returns/updateReturnStatus",

    async (
      {
        returnId,
        status,
      },
      { rejectWithValue }
    ) => {
      try {
        return await updateReturnStatus(
          returnId,
          status
        );
      } catch (error) {
        return rejectWithValue(
          error.response?.data
            ?.message ||
            error.message ||
            "Failed to update return status."
        );
      }
    }
  );

/* =====================================================
   START REFUND

   completed
       ↓
   not_started
       ↓
   pending

   PROTECTION:

   1. Uses original order snapshot.
   2. Uses product + variant identity.
   3. Aggregates duplicate order lines.
   4. Checks previous pending/refunded returns.
   5. Prevents cumulative quantity over-refund.
   6. Prevents cumulative monetary over-refund.
   7. Allocates original order discount.
   8. Final remaining return absorbs rounding remainder.
===================================================== */

export const startRefundThunk =
  createAsyncThunk(
    "returns/startRefund",

    async (
      {
        returnRequest,
        order,
      },
      { rejectWithValue }
    ) => {
      try {
        /* =============================================
           VALIDATE RETURN
        ============================================= */

        if (!returnRequest?.id) {
          throw new Error(
            "Return request is missing."
          );
        }

        const returnStatus =
          (
            returnRequest.status ||
            ""
          ).toLowerCase();

        if (
          returnStatus !==
          "completed"
        ) {
          throw new Error(
            "Refund can only be started after the return inspection is completed."
          );
        }

        const refundStatus =
          (
            returnRequest.refundStatus ||
            "not_started"
          ).toLowerCase();

        if (
          refundStatus !==
          "not_started"
        ) {
          throw new Error(
            "Refund has already been started."
          );
        }

        /* =============================================
           VALIDATE ORDER
        ============================================= */

        if (!order?.id) {
          throw new Error(
            "Order information is missing."
          );
        }

        if (
          String(
            returnRequest.orderId
          ) !==
          String(order.id)
        ) {
          throw new Error(
            "The selected order does not match this return request."
          );
        }

        if (
          returnRequest.userId &&
          order.userId &&
          String(
            returnRequest.userId
          ) !==
            String(order.userId)
        ) {
          throw new Error(
            "The return request does not belong to this order."
          );
        }

        /* =============================================
           PAYMENT
        ============================================= */

        const paymentStatus =
          (
            order.paymentStatus ||
            ""
          ).toLowerCase();

        if (
          paymentStatus !== "paid"
        ) {
          throw new Error(
            "Only paid orders can enter the refund workflow."
          );
        }

        /* =============================================
           RETURN ITEMS
        ============================================= */

        const returnedItems =
          Array.isArray(
            returnRequest.items
          )
            ? returnRequest.items
            : [];

        if (
          returnedItems.length === 0
        ) {
          throw new Error(
            "No returned products were found."
          );
        }

        /* =============================================
           ORIGINAL ORDER ITEMS
        ============================================= */

        const rawOrderItems =
          Array.isArray(order.items)
            ? order.items
            : [];

        if (
          rawOrderItems.length === 0
        ) {
          throw new Error(
            "The original order does not contain any products."
          );
        }

        /* =================================================
           AGGREGATE ORDER ITEMS

           Protects older orders where the same
           product + variant may appear more than once.
        ================================================= */

        const orderItemMap =
          new Map();

        for (
          const orderItem of
          rawOrderItems
        ) {
          if (!orderItem?.id) {
            throw new Error(
              "The original order contains a product without an ID."
            );
          }

          const key =
            getReturnItemKey(
              orderItem
            );

          const quantity =
            Number(
              orderItem.quantity
            );

          const price =
            Number(
              orderItem.price
            );

          if (
            !Number.isInteger(
              quantity
            ) ||
            quantity <= 0
          ) {
            throw new Error(
              `Invalid original quantity for ${
                orderItem.name ||
                "product"
              }.`
            );
          }

          if (
            !Number.isFinite(
              price
            ) ||
            price < 0
          ) {
            throw new Error(
              `Invalid original price for ${
                orderItem.name ||
                "product"
              }.`
            );
          }

          const existing =
            orderItemMap.get(key);

          if (existing) {
            /*
             * Same product + variant appearing twice
             * should normally have the same price.
             *
             * Do not silently combine different prices.
             */

            if (
              roundMoney(
                existing.price
              ) !==
              roundMoney(price)
            ) {
              throw new Error(
                `Multiple order lines for ${
                  orderItem.name ||
                  "product"
                } contain different prices and cannot be refunded automatically.`
              );
            }

            existing.quantity +=
              quantity;

            continue;
          }

          orderItemMap.set(
            key,
            {
              ...orderItem,
              quantity,
              price,
            }
          );
        }

        /* =================================================
           FETCH ALL RETURNS

           We need fresh server data instead of relying
           only on the Redux copy.

           JSON Server still cannot provide a true
           database transaction, but this is much safer.
        ================================================= */

        const allReturns =
          await getAllReturns();

        const safeAllReturns =
          Array.isArray(allReturns)
            ? allReturns
            : [];

        /* =================================================
           RETURNS FOR THIS ORDER

           Exclude the current return.
        ================================================= */

        const otherOrderReturns =
          safeAllReturns.filter(
            (existingReturn) =>
              String(
                existingReturn.orderId
              ) ===
                String(order.id) &&
              String(
                existingReturn.id
              ) !==
                String(
                  returnRequest.id
                )
          );

        /* =================================================
           PREVIOUS FINANCIALLY CONSUMED RETURNS

           pending:
           money has already been allocated

           refunded:
           money has already been paid

           rejected / not_started:
           does not consume refund balance
        ================================================= */

        const consumedReturns =
          otherOrderReturns.filter(
            (existingReturn) => {
              const existingRefundStatus =
                (
                  existingReturn.refundStatus ||
                  "not_started"
                ).toLowerCase();

              return [
                "pending",
                "refunded",
              ].includes(
                existingRefundStatus
              );
            }
          );

        /* =================================================
           PREVIOUS REFUNDED/PENDING QUANTITY BY ITEM
        ================================================= */

        const consumedQuantityMap =
          new Map();

        for (
          const existingReturn of
          consumedReturns
        ) {
          const existingItems =
            Array.isArray(
              existingReturn.items
            )
              ? existingReturn.items
              : [];

          for (
            const item of
            existingItems
          ) {
            if (!item?.id) {
              continue;
            }

            const quantity =
              Number(
                item.quantity
              );

            if (
              !Number.isInteger(
                quantity
              ) ||
              quantity <= 0
            ) {
              continue;
            }

            const key =
              getReturnItemKey(
                item
              );

            const previous =
              consumedQuantityMap.get(
                key
              ) || 0;

            consumedQuantityMap.set(
              key,
              previous +
                quantity
            );
          }
        }

        /* =================================================
           PREVIOUS REFUND MONEY

           Both pending and refunded count.

           A pending refund has already reserved part
           of the refundable balance.
        ================================================= */

        const previouslyAllocatedRefund =
          roundMoney(
            consumedReturns.reduce(
              (
                total,
                existingReturn
              ) => {
                const amount =
                  Number(
                    existingReturn.refundAmount ||
                      0
                  );

                if (
                  !Number.isFinite(
                    amount
                  ) ||
                  amount <= 0
                ) {
                  return total;
                }

                return (
                  total +
                  amount
                );
              },
              0
            )
          );

        /* =============================================
           CURRENT RETURN CALCULATION
        ============================================= */

        let returnedItemsSubtotal =
          0;

        const refundItems =
          [];

        /*
         * Prevent the same key from being duplicated
         * inside the current return request.
         */

        const currentReturnQuantityMap =
          new Map();

        for (
          const returnedItem of
          returnedItems
        ) {
          if (!returnedItem?.id) {
            throw new Error(
              "A returned product is missing its product ID."
            );
          }

          const returnedQuantity =
            Number(
              returnedItem.quantity
            );

          if (
            !Number.isInteger(
              returnedQuantity
            ) ||
            returnedQuantity <= 0
          ) {
            throw new Error(
              `Invalid returned quantity for ${
                returnedItem.name ||
                "product"
              }.`
            );
          }

          const returnedKey =
            getReturnItemKey(
              returnedItem
            );

          const matchingOrderItem =
            orderItemMap.get(
              returnedKey
            );

          if (
            !matchingOrderItem
          ) {
            throw new Error(
              `${
                returnedItem.name ||
                "Returned product"
              } could not be matched to the original order.`
            );
          }

          const orderedQuantity =
            Number(
              matchingOrderItem.quantity
            );

          /* =============================================
             CURRENT RETURN DUPLICATE AGGREGATION
          ============================================= */

          const alreadyInCurrentReturn =
            currentReturnQuantityMap.get(
              returnedKey
            ) || 0;

          const newCurrentQuantity =
            alreadyInCurrentReturn +
            returnedQuantity;

          currentReturnQuantityMap.set(
            returnedKey,
            newCurrentQuantity
          );

          /* =============================================
             PREVIOUSLY CONSUMED QUANTITY
          ============================================= */

          const previouslyConsumedQuantity =
            consumedQuantityMap.get(
              returnedKey
            ) || 0;

          /* =============================================
             CUMULATIVE QUANTITY PROTECTION
          ============================================= */

          const cumulativeQuantity =
            previouslyConsumedQuantity +
            newCurrentQuantity;

          if (
            cumulativeQuantity >
            orderedQuantity
          ) {
            const remainingQuantity =
              Math.max(
                0,
                orderedQuantity -
                  previouslyConsumedQuantity -
                  alreadyInCurrentReturn
              );

            throw new Error(
              `Refund quantity for ${
                matchingOrderItem.name ||
                "product"
              } exceeds the remaining refundable quantity. Only ${remainingQuantity} unit(s) remain refundable.`
            );
          }

          /* =============================================
             ORIGINAL PRICE
          ============================================= */

          const originalPrice =
            Number(
              matchingOrderItem.price
            );

          if (
            !Number.isFinite(
              originalPrice
            ) ||
            originalPrice < 0
          ) {
            throw new Error(
              `Invalid original purchase price for ${
                matchingOrderItem.name ||
                "product"
              }.`
            );
          }

          const lineSubtotal =
            roundMoney(
              originalPrice *
                returnedQuantity
            );

          returnedItemsSubtotal =
            roundMoney(
              returnedItemsSubtotal +
                lineSubtotal
            );

          refundItems.push({
            productId:
              matchingOrderItem.id,

            name:
              matchingOrderItem.name ||
              returnedItem.name ||
              "Product",

            variantId:
              matchingOrderItem.variantId ||
              null,

            variantLabel:
              matchingOrderItem.variantLabel ||
              null,

            quantity:
              returnedQuantity,

            unitPrice:
              originalPrice,

            lineSubtotal,
          });
        }

        if (
          !Number.isFinite(
            returnedItemsSubtotal
          ) ||
          returnedItemsSubtotal <= 0
        ) {
          throw new Error(
            "Invalid returned merchandise amount."
          );
        }

        /* =============================================
           ORDER FINANCIALS
        ============================================= */

        const orderSubtotal =
          Number(order.subtotal);

        const orderDiscount =
          Number(
            order.discount || 0
          );

        const orderTotal =
          Number(order.total);

        const orderShipping =
          Number(
            order.shipping || 0
          );

        if (
          !Number.isFinite(
            orderSubtotal
          ) ||
          orderSubtotal <= 0
        ) {
          throw new Error(
            "Order subtotal is missing or invalid."
          );
        }

        if (
          !Number.isFinite(
            orderDiscount
          ) ||
          orderDiscount < 0
        ) {
          throw new Error(
            "Order discount is invalid."
          );
        }

        if (
          orderDiscount >
          orderSubtotal
        ) {
          throw new Error(
            "Order discount exceeds the order subtotal."
          );
        }

        if (
          !Number.isFinite(
            orderShipping
          ) ||
          orderShipping < 0
        ) {
          throw new Error(
            "Order shipping amount is invalid."
          );
        }

        if (
          !Number.isFinite(
            orderTotal
          ) ||
          orderTotal <= 0
        ) {
          throw new Error(
            "Order total is missing or invalid."
          );
        }

        if (
          returnedItemsSubtotal >
          orderSubtotal
        ) {
          throw new Error(
            "Returned merchandise exceeds the original order subtotal."
          );
        }

        /* =================================================
           MAXIMUM REFUNDABLE MERCHANDISE

           Shipping is intentionally excluded.

           Example:

           subtotal = 100000
           discount = 5000

           maximum merchandise refund = 95000
        ================================================= */

        const maxRefundableMerchandise =
          roundMoney(
            orderSubtotal -
              orderDiscount
          );

        if (
          maxRefundableMerchandise <=
          0
        ) {
          throw new Error(
            "This order has no refundable merchandise balance."
          );
        }

        /* =============================================
           REMAINING REFUNDABLE MONEY
        ============================================= */

        const remainingRefundableAmount =
          roundMoney(
            maxRefundableMerchandise -
              previouslyAllocatedRefund
          );

        if (
          remainingRefundableAmount <=
          0
        ) {
          throw new Error(
            "The refundable balance for this order has already been fully allocated."
          );
        }

        /* =================================================
           PROPORTIONAL DISCOUNT
        ================================================= */

        const returnedShare =
          returnedItemsSubtotal /
          orderSubtotal;

        let allocatedDiscount =
          roundMoney(
            orderDiscount *
              returnedShare
          );

        /* =================================================
           DETERMINE WHETHER THIS RETURN CONSUMES ALL
           REMAINING PURCHASED QUANTITIES

           If yes, it is the final merchandise refund.

           The final return absorbs any paise-level
           proportional rounding remainder.
        ================================================= */

        let allPurchasedQuantityConsumed =
          true;

        for (
          const [
            key,
            orderItem,
          ] of orderItemMap.entries()
        ) {
          const orderedQuantity =
            Number(
              orderItem.quantity
            );

          const previousQuantity =
            consumedQuantityMap.get(
              key
            ) || 0;

          const currentQuantity =
            currentReturnQuantityMap.get(
              key
            ) || 0;

          if (
            previousQuantity +
              currentQuantity <
            orderedQuantity
          ) {
            allPurchasedQuantityConsumed =
              false;

            break;
          }
        }

        /* =============================================
           SHIPPING POLICY
        ============================================= */

        const shippingRefund = 0;

        /* =============================================
           NORMAL PROPORTIONAL REFUND
        ============================================= */

        let refundAmount =
          roundMoney(
            returnedItemsSubtotal -
              allocatedDiscount +
              shippingRefund
          );

        /* =================================================
           FINAL RETURN ROUNDING RECONCILIATION

           If this refund consumes every remaining item,
           use the exact remaining refundable merchandise
           balance.

           This guarantees:

           sum(all refunds)
             =
           subtotal - actual order discount

           without paise rounding drift.
        ================================================= */

        if (
          allPurchasedQuantityConsumed
        ) {
          refundAmount =
            remainingRefundableAmount;

          /*
           * Recalculate the current return's effective
           * discount allocation for the audit snapshot.
           */

          allocatedDiscount =
            roundMoney(
              returnedItemsSubtotal -
                refundAmount +
                shippingRefund
            );

          /*
           * Defensive protection.
           */

          if (
            allocatedDiscount < 0
          ) {
            allocatedDiscount =
              0;
          }
        }

        /* =============================================
           VALIDATE CALCULATED REFUND
        ============================================= */

        if (
          !Number.isFinite(
            refundAmount
          ) ||
          refundAmount <= 0
        ) {
          throw new Error(
            "Calculated refund amount is invalid."
          );
        }

        /* =================================================
           CUMULATIVE MONEY CAP

           Current refund can never consume more than
           the remaining refundable merchandise balance.
        ================================================= */

        if (
          refundAmount >
          remainingRefundableAmount
        ) {
          refundAmount =
            remainingRefundableAmount;

          allocatedDiscount =
            roundMoney(
              returnedItemsSubtotal -
                refundAmount +
                shippingRefund
            );
        }

        refundAmount =
          roundMoney(
            refundAmount
          );

        allocatedDiscount =
          roundMoney(
            Math.max(
              0,
              allocatedDiscount
            )
          );

        /* =============================================
           FINAL CUMULATIVE CHECK
        ============================================= */

        const cumulativeRefundAmount =
          roundMoney(
            previouslyAllocatedRefund +
              refundAmount
          );

        if (
          cumulativeRefundAmount >
          maxRefundableMerchandise
        ) {
          throw new Error(
            "This refund would exceed the remaining refundable balance for the order."
          );
        }

        /* =============================================
           AUDIT BREAKDOWN
        ============================================= */

        const refundBreakdown = {
          returnedItemsSubtotal:
            roundMoney(
              returnedItemsSubtotal
            ),

          orderSubtotal:
            roundMoney(
              orderSubtotal
            ),

          orderDiscount:
            roundMoney(
              orderDiscount
            ),

          returnedShare:
            Number(
              returnedShare.toFixed(
                6
              )
            ),

          allocatedDiscount:
            roundMoney(
              allocatedDiscount
            ),

          shippingRefund:
            roundMoney(
              shippingRefund
            ),

          previouslyAllocatedRefund:
            roundMoney(
              previouslyAllocatedRefund
            ),

          remainingRefundableBefore:
            roundMoney(
              remainingRefundableAmount
            ),

          maxRefundableMerchandise:
            roundMoney(
              maxRefundableMerchandise
            ),

          cumulativeRefundAmount:
            roundMoney(
              cumulativeRefundAmount
            ),

          finalRefundAmount:
            refundAmount,

          isFinalMerchandiseRefund:
            allPurchasedQuantityConsumed,

          items:
            refundItems,
        };

        /* =============================================
           START REFUND
        ============================================= */

        const updatedReturn =
          await updateReturnRequest(
            returnRequest.id,
            {
              refundStatus:
                "pending",

              /*
               * Top-level fields make reporting and
               * auditing easier.
               */

              refundGrossAmount:
                roundMoney(
                  returnedItemsSubtotal
                ),

              refundDiscountAmount:
                roundMoney(
                  allocatedDiscount
                ),

              refundShippingAmount:
                roundMoney(
                  shippingRefund
                ),

              refundAmount,

              refundBreakdown,

              refundStartedAt:
                new Date().toISOString(),
            }
          );

        return updatedReturn;
      } catch (error) {
        return rejectWithValue(
          error.response?.data
            ?.message ||
            error.message ||
            "Failed to start refund."
        );
      }
    }
  );

/* =====================================================
   COMPLETE REFUND
===================================================== */

export const completeRefundThunk =
  createAsyncThunk(
    "returns/completeRefund",

    async (
      {
        returnRequest,
      },
      { rejectWithValue }
    ) => {
      try {
        if (!returnRequest?.id) {
          throw new Error(
            "Return request is missing."
          );
        }

        const returnStatus =
          (
            returnRequest.status ||
            ""
          ).toLowerCase();

        if (
          returnStatus !==
          "completed"
        ) {
          throw new Error(
            "Refund can only be completed for a completed return."
          );
        }

        const refundStatus =
          (
            returnRequest.refundStatus ||
            "not_started"
          ).toLowerCase();

        if (
          refundStatus !==
          "pending"
        ) {
          throw new Error(
            "Only pending refunds can be marked as refunded."
          );
        }

        const refundAmount =
          Number(
            returnRequest.refundAmount
          );

        if (
          !Number.isFinite(
            refundAmount
          ) ||
          refundAmount <= 0
        ) {
          throw new Error(
            "Refund amount is missing or invalid."
          );
        }

        const updatedReturn =
          await updateReturnRequest(
            returnRequest.id,
            {
              refundStatus:
                "refunded",

              refundedAt:
                new Date().toISOString(),
            }
          );

        return updatedReturn;
      } catch (error) {
        return rejectWithValue(
          error.response?.data
            ?.message ||
            error.message ||
            "Failed to complete refund."
        );
      }
    }
  );

/* =====================================================
   RETURN INVENTORY HELPERS
===================================================== */

const prepareReturnStockUpdate =
  async (
    item,
    direction
  ) => {
    if (!item?.id) {
      throw new Error(
        "Returned product ID is missing."
      );
    }

    const quantity =
      Number(item.quantity);

    if (
      !Number.isInteger(
        quantity
      ) ||
      quantity <= 0
    ) {
      throw new Error(
        `Invalid returned quantity for ${
          item.name ||
          "product"
        }.`
      );
    }

    const product =
      await getProductById(
        item.id
      );

    if (!product) {
      throw new Error(
        `${
          item.name ||
          "Product"
        } no longer exists.`
      );
    }

    const hasVariants =
      Array.isArray(
        product.variants
      ) &&
      product.variants.length >
        0;

    /* =================================================
       VARIANT PRODUCT
    ================================================= */

    if (hasVariants) {
      if (!item.variantId) {
        throw new Error(
          `Variant information is missing for ${
            item.name ||
            "product"
          }.`
        );
      }

      const variantIndex =
        product.variants.findIndex(
          (variant) =>
            String(
              variant.id
            ) ===
            String(
              item.variantId
            )
        );

      if (
        variantIndex === -1
      ) {
        throw new Error(
          `The returned configuration for ${
            item.name ||
            "product"
          } no longer exists.`
        );
      }

      const currentVariantStock =
        Number(
          product.variants[
            variantIndex
          ].stock
        );

      if (
        !Number.isFinite(
          currentVariantStock
        )
      ) {
        throw new Error(
          `Invalid variant stock for ${
            item.name ||
            "product"
          }.`
        );
      }

      const newVariantStock =
        direction === "add"
          ? currentVariantStock +
            quantity
          : currentVariantStock -
            quantity;

      if (
        newVariantStock < 0
      ) {
        throw new Error(
          `Cannot reverse inventory for ${
            item.name ||
            "product"
          }. The selected configuration does not have enough stock.`
        );
      }

      const updatedVariants =
        product.variants.map(
          (
            variant,
            index
          ) =>
            index ===
            variantIndex
              ? {
                  ...variant,
                  stock:
                    newVariantStock,
                }
              : {
                  ...variant,
                }
        );

      const totalStock =
        updatedVariants.reduce(
          (
            total,
            variant
          ) =>
            total +
            Number(
              variant.stock || 0
            ),
          0
        );

      return {
        type: "variant",

        productId:
          product.id,

        variants:
          updatedVariants,

        stock:
          totalStock,
      };
    }

    /* =================================================
       SIMPLE PRODUCT
    ================================================= */

    const currentStock =
      Number(product.stock);

    if (
      !Number.isFinite(
        currentStock
      )
    ) {
      throw new Error(
        `Invalid stock for ${
          item.name ||
          "product"
        }.`
      );
    }

    const newStock =
      direction === "add"
        ? currentStock +
          quantity
        : currentStock -
          quantity;

    if (newStock < 0) {
      throw new Error(
        `Cannot reverse inventory for ${
          item.name ||
          "product"
        }. Current stock is too low.`
      );
    }

    return {
      type: "simple",

      productId:
        product.id,

      stock:
        newStock,
    };
  };

/* =====================================================
   APPLY STOCK UPDATE
===================================================== */

const applyReturnStockUpdate =
  async (update) => {
    if (
      update.type ===
      "variant"
    ) {
      await updateProductVariants(
        update.productId,
        update.variants,
        update.stock
      );

      return;
    }

    await updateProductStock(
      update.productId,
      update.stock
    );
  };

/* =====================================================
   COMPLETE RETURN INSPECTION
===================================================== */

export const completeReturnInspectionThunk =
  createAsyncThunk(
    "returns/completeInspection",

    async (
      {
        returnRequest,
        condition,
        note,
      },
      { rejectWithValue }
    ) => {
      try {
        if (!returnRequest?.id) {
          throw new Error(
            "Return request is missing."
          );
        }

        const currentStatus =
          (
            returnRequest.status ||
            ""
          ).toLowerCase();

        if (
          currentStatus !==
          "received"
        ) {
          throw new Error(
            "Only received returns can be inspected."
          );
        }

        if (
          ![
            "resellable",
            "defective",
          ].includes(
            condition
          )
        ) {
          throw new Error(
            "Invalid inspection result."
          );
        }

        const inspectionNote =
          note?.trim() || "";

        if (
          inspectionNote.length <
          10
        ) {
          throw new Error(
            "Inspection note must contain at least 10 characters."
          );
        }

        const items =
          Array.isArray(
            returnRequest.items
          )
            ? returnRequest.items
            : [];

        if (items.length === 0) {
          throw new Error(
            "No returned products were found."
          );
        }

        let stockRestored =
          Boolean(
            returnRequest.stockRestored
          );

        /* =================================================
           RESELLABLE
        ================================================= */

        if (
          condition ===
          "resellable"
        ) {
          if (stockRestored) {
            throw new Error(
              "Stock has already been restored for this return."
            );
          }

          for (
            const item of items
          ) {
            const stockUpdate =
              await prepareReturnStockUpdate(
                item,
                "add"
              );

            await applyReturnStockUpdate(
              stockUpdate
            );
          }

          stockRestored = true;
        }

        /* =================================================
           DEFECTIVE
        ================================================= */

        if (
          condition ===
          "defective"
        ) {
          stockRestored = false;
        }

        const updatedReturn =
          await updateReturnRequest(
            returnRequest.id,
            {
              status:
                "completed",

              inspectionResult:
                condition,

              inspectionNote,

              inspectedAt:
                new Date().toISOString(),

              stockRestored,

              refundStatus:
                returnRequest.refundStatus ||
                "not_started",
            }
          );

        return updatedReturn;
      } catch (error) {
        return rejectWithValue(
          error.response?.data
            ?.message ||
            error.message ||
            "Failed to complete return inspection."
        );
      }
    }
  );

/* =====================================================
   EDIT COMPLETED INSPECTION
===================================================== */

export const editReturnInspectionThunk =
  createAsyncThunk(
    "returns/editInspection",

    async (
      {
        returnRequest,
        condition,
        note,
        editReason,
      },
      { rejectWithValue }
    ) => {
      try {
        if (!returnRequest?.id) {
          throw new Error(
            "Return request is missing."
          );
        }

        const status =
          (
            returnRequest.status ||
            ""
          ).toLowerCase();

        if (
          status !==
          "completed"
        ) {
          throw new Error(
            "Only completed inspections can be edited."
          );
        }

        const refundStatus =
          (
            returnRequest.refundStatus ||
            "not_started"
          ).toLowerCase();

        if (
          [
            "pending",
            "refunded",
          ].includes(
            refundStatus
          )
        ) {
          throw new Error(
            refundStatus ===
              "pending"
              ? "This inspection cannot be edited while the refund is being processed."
              : "This inspection cannot be edited because the refund has already been completed."
          );
        }

        if (
          ![
            "resellable",
            "defective",
          ].includes(
            condition
          )
        ) {
          throw new Error(
            "Invalid inspection result."
          );
        }

        const inspectionNote =
          note?.trim() || "";

        if (
          inspectionNote.length <
          10
        ) {
          throw new Error(
            "Inspection note must contain at least 10 characters."
          );
        }

        const correctionReason =
          editReason?.trim() ||
          "";

        if (
          correctionReason.length <
          10
        ) {
          throw new Error(
            "Please explain why the inspection is being corrected."
          );
        }

        const items =
          Array.isArray(
            returnRequest.items
          )
            ? returnRequest.items
            : [];

        if (items.length === 0) {
          throw new Error(
            "No returned products were found."
          );
        }

        const previousCondition =
          (
            returnRequest.inspectionResult ||
            ""
          ).toLowerCase();

        if (
          ![
            "resellable",
            "defective",
          ].includes(
            previousCondition
          )
        ) {
          throw new Error(
            "The existing inspection result is invalid."
          );
        }

        let stockRestored =
          Boolean(
            returnRequest.stockRestored
          );

        /* =================================================
           DEFECTIVE → RESELLABLE
        ================================================= */

        if (
          previousCondition ===
            "defective" &&
          condition ===
            "resellable"
        ) {
          if (stockRestored) {
            throw new Error(
              "Inventory state is inconsistent. Stock is already marked as restored."
            );
          }

          for (
            const item of items
          ) {
            const stockUpdate =
              await prepareReturnStockUpdate(
                item,
                "add"
              );

            await applyReturnStockUpdate(
              stockUpdate
            );
          }

          stockRestored = true;
        }

        /* =================================================
           RESELLABLE → DEFECTIVE
        ================================================= */

        if (
          previousCondition ===
            "resellable" &&
          condition ===
            "defective"
        ) {
          if (!stockRestored) {
            throw new Error(
              "Inventory state is inconsistent. Restored stock was not recorded."
            );
          }

          for (
            const item of items
          ) {
            const stockUpdate =
              await prepareReturnStockUpdate(
                item,
                "remove"
              );

            await applyReturnStockUpdate(
              stockUpdate
            );
          }

          stockRestored = false;
        }

        const updatedReturn =
          await updateReturnRequest(
            returnRequest.id,
            {
              status:
                "completed",

              inspectionResult:
                condition,

              inspectionNote,

              stockRestored,

              inspectionUpdatedAt:
                new Date().toISOString(),

              inspectionUpdatedReason:
                correctionReason,

              refundStatus:
                returnRequest.refundStatus ||
                "not_started",
            }
          );

        return updatedReturn;
      } catch (error) {
        return rejectWithValue(
          error.response?.data
            ?.message ||
            error.message ||
            "Failed to edit return inspection."
        );
      }
    }
  );

/* =====================================================
   HELPER
===================================================== */

const replaceReturn = (
  state,
  updatedReturn
) => {
  const index =
    state.items.findIndex(
      (item) =>
        String(item.id) ===
        String(
          updatedReturn?.id
        )
    );

  if (index !== -1) {
    state.items[index] =
      updatedReturn;
  }
};

/* =====================================================
   SLICE
===================================================== */

const returnSlice =
  createSlice({
    name: "returns",

    initialState,

    reducers: {
      clearReturns: (
        state
      ) => {
        state.items = [];
        state.loading = false;
        state.error = null;
        state.creating = false;
        state.updatingReturnId =
          null;
        state.updatingRefundId =
          null;
        state.inspectingReturnId =
          null;
        state.editingInspectionId =
          null;
      },

      clearReturnError: (
        state
      ) => {
        state.error = null;
      },
    },

    extraReducers: (
      builder
    ) => {
      builder

        /* =============================================
           CREATE RETURN
        ============================================= */

        .addCase(
          createReturnRequestThunk.pending,

          (state) => {
            state.creating = true;
            state.error = null;
          }
        )

        .addCase(
          createReturnRequestThunk.fulfilled,

          (
            state,
            action
          ) => {
            state.creating = false;
            state.error = null;

            state.items.unshift(
              action.payload
            );
          }
        )

        .addCase(
          createReturnRequestThunk.rejected,

          (
            state,
            action
          ) => {
            state.creating = false;

            state.error =
              action.payload ||
              "Failed to create return request.";
          }
        )

        /* =============================================
           FETCH USER RETURNS
        ============================================= */

        .addCase(
          fetchUserReturns.pending,

          (state) => {
            state.loading = true;
            state.error = null;
          }
        )

        .addCase(
          fetchUserReturns.fulfilled,

          (
            state,
            action
          ) => {
            state.loading = false;
            state.error = null;

            state.items =
              Array.isArray(
                action.payload
              )
                ? action.payload
                : [];
          }
        )

        .addCase(
          fetchUserReturns.rejected,

          (
            state,
            action
          ) => {
            state.loading = false;

            state.error =
              action.payload ||
              "Failed to fetch return requests.";
          }
        )

        /* =============================================
           FETCH ALL RETURNS
        ============================================= */

        .addCase(
          fetchAllReturns.pending,

          (state) => {
            state.loading = true;
            state.error = null;
          }
        )

        .addCase(
          fetchAllReturns.fulfilled,

          (
            state,
            action
          ) => {
            state.loading = false;
            state.error = null;

            state.items =
              Array.isArray(
                action.payload
              )
                ? action.payload
                : [];
          }
        )

        .addCase(
          fetchAllReturns.rejected,

          (
            state,
            action
          ) => {
            state.loading = false;

            state.error =
              action.payload ||
              "Failed to fetch returns.";
          }
        )

        /* =============================================
           UPDATE STATUS
        ============================================= */

        .addCase(
          updateReturnStatusThunk.pending,

          (
            state,
            action
          ) => {
            state.updatingReturnId =
              action.meta.arg
                .returnId;

            state.error = null;
          }
        )

        .addCase(
          updateReturnStatusThunk.fulfilled,

          (
            state,
            action
          ) => {
            state.updatingReturnId =
              null;

            state.error = null;

            replaceReturn(
              state,
              action.payload
            );
          }
        )

        .addCase(
          updateReturnStatusThunk.rejected,

          (
            state,
            action
          ) => {
            state.updatingReturnId =
              null;

            state.error =
              action.payload ||
              "Failed to update return status.";
          }
        )

        /* =============================================
           START REFUND
        ============================================= */

        .addCase(
          startRefundThunk.pending,

          (
            state,
            action
          ) => {
            state.updatingRefundId =
              action.meta.arg
                .returnRequest
                ?.id ||
              null;

            state.error = null;
          }
        )

        .addCase(
          startRefundThunk.fulfilled,

          (
            state,
            action
          ) => {
            state.updatingRefundId =
              null;

            state.error = null;

            replaceReturn(
              state,
              action.payload
            );
          }
        )

        .addCase(
          startRefundThunk.rejected,

          (
            state,
            action
          ) => {
            state.updatingRefundId =
              null;

            state.error =
              action.payload ||
              "Failed to start refund.";
          }
        )

        /* =============================================
           COMPLETE REFUND
        ============================================= */

        .addCase(
          completeRefundThunk.pending,

          (
            state,
            action
          ) => {
            state.updatingRefundId =
              action.meta.arg
                .returnRequest
                ?.id ||
              null;

            state.error = null;
          }
        )

        .addCase(
          completeRefundThunk.fulfilled,

          (
            state,
            action
          ) => {
            state.updatingRefundId =
              null;

            state.error = null;

            replaceReturn(
              state,
              action.payload
            );
          }
        )

        .addCase(
          completeRefundThunk.rejected,

          (
            state,
            action
          ) => {
            state.updatingRefundId =
              null;

            state.error =
              action.payload ||
              "Failed to complete refund.";
          }
        )

        /* =============================================
           COMPLETE INSPECTION
        ============================================= */

        .addCase(
          completeReturnInspectionThunk.pending,

          (
            state,
            action
          ) => {
            state.inspectingReturnId =
              action.meta.arg
                .returnRequest
                ?.id ||
              null;

            state.error = null;
          }
        )

        .addCase(
          completeReturnInspectionThunk.fulfilled,

          (
            state,
            action
          ) => {
            state.inspectingReturnId =
              null;

            state.error = null;

            replaceReturn(
              state,
              action.payload
            );
          }
        )

        .addCase(
          completeReturnInspectionThunk.rejected,

          (
            state,
            action
          ) => {
            state.inspectingReturnId =
              null;

            state.error =
              action.payload ||
              "Failed to complete return inspection.";
          }
        )

        /* =============================================
           EDIT INSPECTION
        ============================================= */

        .addCase(
          editReturnInspectionThunk.pending,

          (
            state,
            action
          ) => {
            state.editingInspectionId =
              action.meta.arg
                .returnRequest
                ?.id ||
              null;

            state.error = null;
          }
        )

        .addCase(
          editReturnInspectionThunk.fulfilled,

          (
            state,
            action
          ) => {
            state.editingInspectionId =
              null;

            state.error = null;

            replaceReturn(
              state,
              action.payload
            );
          }
        )

        .addCase(
          editReturnInspectionThunk.rejected,

          (
            state,
            action
          ) => {
            state.editingInspectionId =
              null;

            state.error =
              action.payload ||
              "Failed to edit return inspection.";
          }
        );
    },
  });

/* =====================================================
   ACTIONS
===================================================== */

export const {
  clearReturns,
  clearReturnError,
} = returnSlice.actions;

/* =====================================================
   REDUCER
===================================================== */

export default returnSlice.reducer;