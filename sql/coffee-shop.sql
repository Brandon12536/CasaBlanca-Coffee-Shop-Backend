SET
    statement_timeout = 0;

SET
    lock_timeout = 0;

SET
    idle_in_transaction_session_timeout = 0;

SET
    client_encoding = 'UTF8';

SET
    standard_conforming_strings = on;

SELECT
    pg_catalog.set_config('search_path', '', false);

SET
    check_function_bodies = false;

SET
    xmloption = content;

SET
    client_min_messages = warning;

SET
    row_security = off;

COMMENT ON SCHEMA "public" IS 'standard public schema';

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET
    default_tablespace = '';

SET
    default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."cart" (
    "id_cart" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "product_id" "uuid",
    "product_name" "text" NOT NULL,
    "product_image" "text",
    "product_price" numeric(10, 2) NOT NULL,
    "quantity" integer DEFAULT 1 NOT NULL,
    "added_at" timestamp with time zone DEFAULT "timezone"('utc' :: "text", "now"())
);

ALTER TABLE
    "public"."cart" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."cart_temp" (
    "id_cart_temp" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "session_id" "text" NOT NULL,
    "product_id" "uuid",
    "product_name" "text" NOT NULL,
    "product_image" "text",
    "product_price" numeric(10, 2) NOT NULL,
    "quantity" integer DEFAULT 1 NOT NULL,
    "added_at" timestamp with time zone DEFAULT "timezone"('utc' :: "text", "now"())
);

ALTER TABLE
    "public"."cart_temp" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."order_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid",
    "product_id" "uuid",
    "quantity" integer NOT NULL,
    "price" integer NOT NULL
);

ALTER TABLE
    "public"."order_items" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "total" integer NOT NULL,
    "payment_method" "text" NOT NULL,
    "status" "text" DEFAULT 'pending' :: "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc' :: "text", "now"()),
    "shipping_address_id" "uuid",
    "shipping_address" "text"
);

ALTER TABLE
    "public"."orders" OWNER TO "postgres";

ALTER TABLE public.orders ADD COLUMN canceled_at timestamp with time zone;

CREATE TABLE IF NOT EXISTS "public"."payments" (
    "id_payments" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid",
    "user_id" "uuid",
    "stripe_payment_id" "text" NOT NULL,
    "amount" integer NOT NULL,
    "currency" "text" DEFAULT 'mxn' :: "text" NOT NULL,
    "status" "text" DEFAULT 'pending' :: "text" NOT NULL,
    "payment_method" "text",
    "receipt_url" "text",
    "cancellation_reason" "text",
    "canceled_at" timestamp with time zone,
    "refund_id" "text",
    "refund_amount" numeric(10, 2),
    "refund_status" "text",
    "stripe_event_data" "jsonb",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc' :: "text", "now"())
);

ALTER TABLE
    "public"."payments" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text" NOT NULL,
    "price" integer NOT NULL,
    "category" "text" NOT NULL,
    "image" "text" NOT NULL,
    "available" boolean DEFAULT true NOT NULL,
    "featured" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc' :: "text", "now"())
);

ALTER TABLE
    "public"."products" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."reservaciones" (
    "id_reservaciones" integer NOT NULL,
    "nombre_completo" "text" NOT NULL,
    "correo_electronico" "text" NOT NULL,
    "fecha_visita" "date" NOT NULL,
    "hora_visita" "text" NOT NULL,
    "numero_personas" integer NOT NULL,
    "notas_adicionales" "text",
    "telefono" character varying(20) DEFAULT '' :: character varying NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('America/Mexico_City' :: "text", "now"())
);

ALTER TABLE
    "public"."reservaciones" OWNER TO "postgres";

CREATE SEQUENCE IF NOT EXISTS "public"."reservaciones_id_reservaciones_seq" AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

ALTER TABLE
    "public"."reservaciones_id_reservaciones_seq" OWNER TO "postgres";

ALTER SEQUENCE "public"."reservaciones_id_reservaciones_seq" OWNED BY "public"."reservaciones"."id_reservaciones";

CREATE TABLE IF NOT EXISTS "public"."user_addresses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "address_line1" "text" NOT NULL,
    "address_line2" "text",
    "city" "text" NOT NULL,
    "state" "text" NOT NULL,
    "postal_code" "text" NOT NULL,
    "country" "text" DEFAULT 'Mexico' :: "text" NOT NULL,
    "phone" character varying(20),
    "is_default" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc' :: "text", "now"()) NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"()
);

ALTER TABLE
    "public"."user_addresses" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "password" "text" NOT NULL,
    "role" "text" DEFAULT 'customer' :: "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc' :: "text", "now"())
);

ALTER TABLE
    "public"."users" OWNER TO "postgres";

ALTER TABLE
    ONLY "public"."reservaciones"
ALTER COLUMN
    "id_reservaciones"
SET
    DEFAULT "nextval"(
        '"public"."reservaciones_id_reservaciones_seq"' :: "regclass"
    );

ALTER TABLE
    ONLY "public"."cart"
ADD
    CONSTRAINT "cart_pkey" PRIMARY KEY ("id_cart");

ALTER TABLE
    ONLY "public"."cart_temp"
ADD
    CONSTRAINT "cart_temp_pkey" PRIMARY KEY ("id_cart_temp");

ALTER TABLE
    ONLY "public"."order_items"
ADD
    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id");

ALTER TABLE
    ONLY "public"."orders"
ADD
    CONSTRAINT "orders_pkey" PRIMARY KEY ("id");

ALTER TABLE
    ONLY "public"."payments"
ADD
    CONSTRAINT "payments_pkey" PRIMARY KEY ("id_payments");

ALTER TABLE
    ONLY "public"."payments"
ADD
    CONSTRAINT "payments_stripe_payment_id_key" UNIQUE ("stripe_payment_id");

ALTER TABLE
    ONLY "public"."products"
ADD
    CONSTRAINT "products_pkey" PRIMARY KEY ("id");

ALTER TABLE
    ONLY "public"."reservaciones"
ADD
    CONSTRAINT "reservaciones_pkey" PRIMARY KEY ("id_reservaciones");

ALTER TABLE
    ONLY "public"."user_addresses"
ADD
    CONSTRAINT "user_addresses_pkey" PRIMARY KEY ("id");

ALTER TABLE
    ONLY "public"."users"
ADD
    CONSTRAINT "users_email_key" UNIQUE ("email");

ALTER TABLE
    ONLY "public"."users"
ADD
    CONSTRAINT "users_pkey" PRIMARY KEY ("id");

CREATE
OR REPLACE TRIGGER "set_updated_at" BEFORE
UPDATE
    ON "public"."user_addresses" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

ALTER TABLE
    ONLY "public"."cart"
ADD
    CONSTRAINT "cart_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;

ALTER TABLE
    ONLY "public"."cart_temp"
ADD
    CONSTRAINT "cart_temp_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;

ALTER TABLE
    ONLY "public"."cart"
ADD
    CONSTRAINT "cart_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE
    ONLY "public"."order_items"
ADD
    CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;

ALTER TABLE
    ONLY "public"."order_items"
ADD
    CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE
SET
    NULL;

ALTER TABLE
    ONLY "public"."orders"
ADD
    CONSTRAINT "orders_shipping_address_id_fkey" FOREIGN KEY ("shipping_address_id") REFERENCES "public"."user_addresses"("id") ON DELETE
SET
    NULL;

ALTER TABLE
    ONLY "public"."orders"
ADD
    CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE
SET
    NULL;

ALTER TABLE
    ONLY "public"."payments"
ADD
    CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;

ALTER TABLE
    ONLY "public"."payments"
ADD
    CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE
SET
    NULL;

ALTER TABLE
    ONLY "public"."user_addresses"
ADD
    CONSTRAINT "user_addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

CREATE POLICY "Allow all cart operations" ON "public"."cart" USING (true);

CREATE POLICY "Allow all products" ON "public"."products" USING (true);

CREATE POLICY "Allow all select users" ON "public"."users" FOR
SELECT
    USING (true);

CREATE POLICY "Allow all users" ON "public"."users" USING (true);

CREATE POLICY "Allow insert payments from backend" ON "public"."payments" FOR
INSERT
    WITH CHECK (true);

CREATE POLICY "Allow insert payments from webhook" ON "public"."payments" FOR
INSERT
    WITH CHECK (true);

CREATE POLICY "Cart: solo dueño puede operar" ON "public"."cart" USING (("auth"."uid"() = "user_id"));

CREATE POLICY "CartTemp: select abierto" ON "public"."cart_temp" FOR
SELECT
    USING (true);

CREATE POLICY "CartTemp: solo por session_id" ON "public"."cart_temp" USING (
    (
        "session_id" = "current_setting"('request.jwt.claim.session_id' :: "text", true)
    )
);

CREATE POLICY "Delete own addresses" ON "public"."user_addresses" FOR DELETE USING (("user_id" = "auth"."uid"()));

CREATE POLICY "Insert own addresses" ON "public"."user_addresses" FOR
INSERT
    WITH CHECK (("user_id" = "auth"."uid"()));

CREATE POLICY "OrderItems: Admins can manage all items" ON "public"."order_items" USING (("auth"."role"() = 'admin' :: "text")) WITH CHECK (("auth"."role"() = 'admin' :: "text"));

CREATE POLICY "OrderItems: Users can view own items" ON "public"."order_items" FOR
SELECT
    USING (
        (
            EXISTS (
                SELECT
                    1
                FROM
                    "public"."orders" "o"
                WHERE
                    (
                        ("o"."id" = "order_items"."order_id")
                        AND ("auth"."uid"() = "o"."user_id")
                    )
            )
        )
    );

CREATE POLICY "OrderItems: service_role puede insertar" ON "public"."order_items" FOR
INSERT
    TO "service_role" WITH CHECK (true);

CREATE POLICY "Orders: Admins can delete" ON "public"."orders" FOR DELETE USING (("auth"."role"() = 'admin' :: "text"));

CREATE POLICY "Orders: Admins can update" ON "public"."orders" FOR
UPDATE
    USING (("auth"."role"() = 'admin' :: "text"));

CREATE POLICY "Orders: Admins can view all" ON "public"."orders" FOR
SELECT
    USING (("auth"."role"() = 'admin' :: "text"));

CREATE POLICY "Orders: Users can view own" ON "public"."orders" FOR
SELECT
    USING (("auth"."uid"() = "user_id"));

CREATE POLICY "Orders: service_role puede insertar" ON "public"."orders" FOR
INSERT
    TO "service_role" WITH CHECK (true);

CREATE POLICY "Payments: service_role puede insertar" ON "public"."payments" FOR
INSERT
    TO "service_role" WITH CHECK (true);

CREATE POLICY "Select own addresses" ON "public"."user_addresses" FOR
SELECT
    USING (("user_id" = "auth"."uid"()));

CREATE POLICY "Update own addresses" ON "public"."user_addresses" FOR
UPDATE
    USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));

CREATE POLICY "User can manage own addresses" ON "public"."user_addresses" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));

CREATE POLICY "UserAddresses: Owner can manage own" ON "public"."user_addresses" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));

ALTER TABLE
    "public"."cart" ENABLE ROW LEVEL SECURITY;

ALTER TABLE
    "public"."cart_temp" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "delete_own_addresses" ON "public"."user_addresses" FOR DELETE USING (("user_id" = "auth"."uid"()));

CREATE POLICY "insert_own_addresses" ON "public"."user_addresses" FOR
INSERT
    WITH CHECK (("user_id" = "auth"."uid"()));

ALTER TABLE
    "public"."order_items" ENABLE ROW LEVEL SECURITY;

ALTER TABLE
    "public"."orders" ENABLE ROW LEVEL SECURITY;

ALTER TABLE
    "public"."payments" ENABLE ROW LEVEL SECURITY;

ALTER TABLE
    "public"."products" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_addresses" ON "public"."user_addresses" FOR
SELECT
    USING (("user_id" = "auth"."uid"()));

CREATE POLICY "update_own_addresses" ON "public"."user_addresses" FOR
UPDATE
    USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));

ALTER TABLE
    "public"."user_addresses" ENABLE ROW LEVEL SECURITY;

ALTER TABLE
    "public"."users" ENABLE ROW LEVEL SECURITY;

ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";

GRANT USAGE ON SCHEMA "public" TO "postgres";

GRANT USAGE ON SCHEMA "public" TO "anon";

GRANT USAGE ON SCHEMA "public" TO "authenticated";

GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";

GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";

GRANT ALL ON TABLE "public"."cart" TO "anon";

GRANT ALL ON TABLE "public"."cart" TO "authenticated";

GRANT ALL ON TABLE "public"."cart" TO "service_role";

GRANT ALL ON TABLE "public"."cart_temp" TO "anon";

GRANT ALL ON TABLE "public"."cart_temp" TO "authenticated";

GRANT ALL ON TABLE "public"."cart_temp" TO "service_role";

GRANT ALL ON TABLE "public"."order_items" TO "anon";

GRANT ALL ON TABLE "public"."order_items" TO "authenticated";

GRANT ALL ON TABLE "public"."order_items" TO "service_role";

GRANT ALL ON TABLE "public"."orders" TO "anon";

GRANT ALL ON TABLE "public"."orders" TO "authenticated";

GRANT ALL ON TABLE "public"."orders" TO "service_role";

GRANT ALL ON TABLE "public"."payments" TO "anon";

GRANT ALL ON TABLE "public"."payments" TO "authenticated";

GRANT ALL ON TABLE "public"."payments" TO "service_role";

GRANT ALL ON TABLE "public"."products" TO "anon";

GRANT ALL ON TABLE "public"."products" TO "authenticated";

GRANT ALL ON TABLE "public"."products" TO "service_role";

GRANT ALL ON TABLE "public"."reservaciones" TO "anon";

GRANT ALL ON TABLE "public"."reservaciones" TO "authenticated";

GRANT ALL ON TABLE "public"."reservaciones" TO "service_role";

GRANT ALL ON SEQUENCE "public"."reservaciones_id_reservaciones_seq" TO "anon";

GRANT ALL ON SEQUENCE "public"."reservaciones_id_reservaciones_seq" TO "authenticated";

GRANT ALL ON SEQUENCE "public"."reservaciones_id_reservaciones_seq" TO "service_role";

GRANT ALL ON TABLE "public"."user_addresses" TO "anon";

GRANT ALL ON TABLE "public"."user_addresses" TO "authenticated";

GRANT ALL ON TABLE "public"."user_addresses" TO "service_role";

GRANT ALL ON TABLE "public"."users" TO "anon";

GRANT ALL ON TABLE "public"."users" TO "authenticated";

GRANT ALL ON TABLE "public"."users" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";

RESET ALL;


CREATE TABLE reservaciones (
    id_reservaciones SERIAL PRIMARY KEY,
    nombre_completo TEXT NOT NULL,
    correo_electronico TEXT NOT NULL,
    fecha_visita DATE NOT NULL,
    hora_visita TEXT NOT NULL,
    numero_personas INTEGER NOT NULL,
    notas_adicionales TEXT,
    telefono VARCHAR(10) NOT NULL DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('America/Mexico_City', now())
);

CREATE POLICY "Allow all insert reviews" ON public.reviews
  FOR INSERT
  WITH CHECK (true);