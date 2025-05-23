// src/constants/orderStatuses.js
module.exports = {
  ORDER_STATUS: {
    PROCESSING: "processing",
    PREPARING: "preparing",
    READY: "ready",
    SHIPPED: "shipped",
    DELIVERED: "delivered",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
  },

  PAYMENT_METHODS: {
    CASH: "cash",
    CARD: "card",
    TRANSFER: "transfer",
  },

  STATS_ORDER_STATUSES: [
    "processing",
    "preparing",
    "ready",
    "shipped",
    "delivered",
    "completed",
  ],
};
