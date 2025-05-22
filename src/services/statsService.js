// src/services/statsService.js
const supabase = require("../config/supabase");
const { STATS_ORDER_STATUSES } = require("../constants/orderStatuses");

const handleServiceError = (error, context) => {
  console.error(`[StatsService] Error en ${context}:`, error);
  throw new Error(`Failed to ${context}: ${error.message}`);
};

exports.getSalesSummary = async () => {
  try {
    const { data: orders } = await supabase
      .from("orders")
      .select("id, total, status, created_at")
      .in("status", STATS_ORDER_STATUSES)
      .order("created_at", { ascending: false });

    console.log("Órdenes consideradas para estadísticas:", orders?.slice(0, 5));

    const { data, error } = await supabase.rpc("get_sales_summary", {
      valid_statuses: STATS_ORDER_STATUSES,
    });

    if (error) throw error;

    return {
      totalSales: Number(data[0]?.total_sales || 0),
      monthlySales: Number(data[0]?.monthly_sales || 0),
      totalOrders: Number(data[0]?.total_orders || 0),
    };
  } catch (error) {
    console.error("Error detallado:", error);
    handleServiceError(error, "obtener resumen de ventas");
  }
};

exports.getSalesByPeriod = async (period = "month") => {
  try {
    const validPeriods = ["day", "week", "month", "year"];
    if (!validPeriods.includes(period)) {
      throw new Error(`Período no válido. Usar: ${validPeriods.join(", ")}`);
    }

    const { data, error } = await supabase.rpc("get_sales_by_period", {
      interval_param: period,
      valid_statuses: STATS_ORDER_STATUSES,
    });

    if (error) throw error;

    return data.map((item) => ({
      period_start: item.period_start,
      period_end: item.period_end,
      total_sales: Number(item.total_sales),
      order_count: Number(item.order_count),
    }));
  } catch (error) {
    console.error("Error detallado en getSalesByPeriod:", error);
    handleServiceError(error, "obtener ventas por período");
  }
};

exports.getTopProducts = async (limit = 5) => {
  try {
    if (limit <= 0) limit = 5;

    const { data, error } = await supabase
      .from("order_items")
      .select(
        `
        product_id,
        quantity,
        products (name, image)
      `
      )
      .order("quantity", { ascending: false })
      .limit(limit);

    if (error) throw error;

    const grouped = data.reduce((acc, item) => {
      const existing = acc.find((i) => i.product_id === item.product_id);
      if (existing) {
        existing.total_quantity += item.quantity;
      } else {
        acc.push({
          product_id: item.product_id,
          total_quantity: item.quantity,
          products: item.products,
        });
      }
      return acc;
    }, []);

    return grouped
      .sort((a, b) => b.total_quantity - a.total_quantity)
      .slice(0, limit);
  } catch (error) {
    handleServiceError(error, "obtener productos más vendidos");
  }
};

exports.getCustomerStats = async () => {
  try {
    const { data, error } = await supabase.rpc("get_customer_stats");

    if (error) throw error;
    return {
      totalCustomers: data.total_customers || 0,
      newCustomers: data.new_customers || 0,
    };
  } catch (error) {
    handleServiceError(error, "obtener estadísticas de clientes");
  }
};

exports.getReservationStats = async () => {
  try {
    const { data, error } = await supabase.rpc("get_reservation_stats");

    if (error) throw error;
    return {
      totalReservations: data.total_reservations || 0,
      monthlyReservations: data.monthly_reservations || 0,
    };
  } catch (error) {
    handleServiceError(error, "obtener estadísticas de reservaciones");
  }
};
