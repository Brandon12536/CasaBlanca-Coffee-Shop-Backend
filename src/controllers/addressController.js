const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const TABLE = "user_addresses";

const SELECT_FIELDS =
  "id,user_id,address_line1,address_line2,city,state,postal_code,country,phone,is_default,created_at,updated_at";

// Función para mapear is_default → isDefault
const mapFields = (rows) =>
  rows.map((r) => ({
    ...r,
    isDefault: r.is_default,
  }));

exports.getAddresses = async (req, res) => {
  try {
    console.log("🧪 req.user:", req.user); // 👈 LOG CRÍTICO

    const userId = req.user.id;

    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select(SELECT_FIELDS)
      .eq("user_id", userId);

    if (error) throw error;

    return res.json(mapFields(data));
  } catch (err) {
    console.error("❌ getAddresses error:", err);
    return res.status(500).json({
      message: "Error al listar direcciones",
      error: err.message,
    });
  }
};


exports.addAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      address_line1,
      address_line2,
      city,
      state,
      postal_code,
      country,
      phone,
      isDefault = false,
    } = req.body;

    if (isDefault) {
      const { error: resetError } = await supabaseAdmin
        .from(TABLE)
        .update({ is_default: false })
        .eq("user_id", userId);
      if (resetError) throw resetError;
    }

    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .insert([
        {
          user_id: userId,
          address_line1,
          address_line2,
          city,
          state,
          postal_code,
          country,
          phone,
          is_default: isDefault,
        },
      ])
      .select(SELECT_FIELDS);

    if (error) throw error;

    return res.status(201).json(mapFields(data));
  } catch (err) {
    console.error("addAddress error:", err);
    return res.status(500).json({
      message: "Error al guardar la dirección",
      error: err.message,
    });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addrId = req.params.addrId;
    const updates = req.body;

    if (updates.isDefault) {
      const { error: resetError } = await supabaseAdmin
        .from(TABLE)
        .update({ is_default: false })
        .eq("user_id", userId);
      if (resetError) throw resetError;
    }

    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .update({
        ...updates,
        is_default: updates.isDefault,
      })
      .match({ id: addrId, user_id: userId })
      .select(SELECT_FIELDS);

    if (error) throw error;

    return res.json(mapFields(data));
  } catch (err) {
    console.error("updateAddress error:", err);
    return res.status(500).json({
      message: "Error al actualizar la dirección",
      error: err.message,
    });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addrId = req.params.addrId;

    const { error } = await supabaseAdmin
      .from(TABLE)
      .delete()
      .match({ id: addrId, user_id: userId });

    if (error) throw error;

    return res.json({ message: "Dirección eliminada" });
  } catch (err) {
    console.error("deleteAddress error:", err);
    return res.status(500).json({
      message: "Error al eliminar la dirección",
      error: err.message,
    });
  }
};
