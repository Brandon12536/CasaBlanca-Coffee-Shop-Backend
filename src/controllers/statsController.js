// src/controllers/statsController.js
const statsService = require("../services/statsService");
const {
  OK,
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
} = require("../constants/statusCodes");
const { validatePeriod, validateLimit } = require("../utils/validators");

/**
 * @desc    Obtiene un resumen general de ventas
 * @route   GET /api/stats/sales-summary
 * @access  Privado/Admin
 */
const getSalesSummary = async (req, res) => {
  try {
    const summary = await statsService.getSalesSummary();

    res.status(OK).json({
      success: true,
      data: summary,
      message: "Resumen de ventas obtenido correctamente",
    });
  } catch (error) {
    console.error("[StatsController] Error en getSalesSummary:", error);

    res.status(INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Error al obtener el resumen de ventas",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Obtiene ventas agrupadas por período
 * @route   GET /api/stats/sales-by-period?period=month
 * @access  Privado/Admin
 */
const getSalesByPeriod = async (req, res) => {
  try {
    const { period = "month" } = req.query;

    if (!validatePeriod(period)) {
      return res.status(BAD_REQUEST).json({
        success: false,
        message: "Período no válido. Usar: day, week, month o year",
      });
    }

    const data = await statsService.getSalesByPeriod(period);

    res.status(OK).json({
      success: true,
      data,
      message: `Ventas por período (${period}) obtenidas correctamente`,
    });
  } catch (error) {
    console.error("[StatsController] Error en getSalesByPeriod:", error);

    res.status(INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Error al obtener ventas por período",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Obtiene los productos más vendidos
 * @route   GET /api/stats/top-products?limit=5
 * @access  Privado/Admin
 */
const getTopProducts = async (req, res) => {
  try {
    let { limit = 5 } = req.query;
    limit = parseInt(limit);

    if (!validateLimit(limit)) {
      return res.status(BAD_REQUEST).json({
        success: false,
        message: "El límite debe ser un número entre 1 y 100",
      });
    }

    const products = await statsService.getTopProducts(limit);

    res.status(OK).json({
      success: true,
      data: products,
      message: `Top ${limit} productos obtenidos correctamente`,
    });
  } catch (error) {
    console.error("[StatsController] Error en getTopProducts:", error);

    res.status(INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Error al obtener productos más vendidos",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Obtiene estadísticas de clientes
 * @route   GET /api/stats/customer-stats
 * @access  Privado/Admin
 */
const getCustomerStats = async (req, res) => {
  try {
    const stats = await statsService.getCustomerStats();

    res.status(OK).json({
      success: true,
      data: stats,
      message: "Estadísticas de clientes obtenidas correctamente",
    });
  } catch (error) {
    console.error("[StatsController] Error en getCustomerStats:", error);

    res.status(INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Error al obtener estadísticas de clientes",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Obtiene estadísticas de reservaciones
 * @route   GET /api/stats/reservation-stats
 * @access  Privado/Admin
 */
const getReservationStats = async (req, res) => {
  try {
    const stats = await statsService.getReservationStats();

    res.status(OK).json({
      success: true,
      data: stats,
      message: "Estadísticas de reservaciones obtenidas correctamente",
    });
  } catch (error) {
    console.error("[StatsController] Error en getReservationStats:", error);

    res.status(INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Error al obtener estadísticas de reservaciones",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  getSalesSummary,
  getSalesByPeriod,
  getTopProducts,
  getCustomerStats,
  getReservationStats,
};
