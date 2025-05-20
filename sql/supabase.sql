create table public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password text not null,
  role text not null default 'customer',
  created_at timestamp with time zone default timezone('utc'::text, now())
);
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  price numeric not null,
  category text not null,
  image text not null,
  available boolean not null default true,
  featured boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  total numeric not null,
  shipping_address text,
  payment_method text not null,
  status text not null default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  quantity integer not null,
  price numeric not null
);

-- Tabla temporal para carrito de visitantes
create table if not exists public.cart_temp (
  id_cart_temp uuid primary key default gen_random_uuid(),
  session_id text not null,
  product_id uuid references public.products(id) on delete cascade,
  product_name text not null,
  product_image text,
  product_price numeric(10,2) not null,
  quantity integer not null default 1,
  added_at timestamp with time zone default timezone('utc'::text, now())
);

-- Tabla de carrito para usuarios autenticados
create table if not exists public.cart (
  id_cart uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  product_name text not null,
  product_image text,
  product_price numeric(10,2) not null,
  quantity integer not null default 1,
  added_at timestamp with time zone default timezone('utc'::text, now())
);

-- Tabla para pagos con Stripe
create table public.payments (
  id_payments uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  stripe_payment_id text not null unique, --
  amount numeric(10,2) not null, 
  currency text not null default 'mxn',
  status text not null default 'pending', -- pending, succeeded, failed, refunded, etc.
  payment_method text, -- Tarjeta, efectivo, etc.
  receipt_url text, -- URL del recibo de Stripe
  cancellation_reason text, -- Motivo de la cancelación
  canceled_at timestamp with time zone, -- Fecha de cancelación
  refund_id text, -- ID del reembolso en Stripe
  refund_amount numeric(10,2), -- Monto reembolsado
  refund_status text, -- Estado del reembolso
  stripe_event_data jsonb, -- Objeto del evento Stripe relacionado
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Habilitar RLS en todas las tablas
alter table public.users enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.cart enable row level security;
alter table public.cart_temp enable row level security;
alter table public.payments enable row level security;

-- Permitir todo para pruebas (¡quitar en producción!)
create policy "Allow all users" on public.users for all using (true);
create policy "Allow all products" on public.products for all using (true);
create policy "Allow all orders" on public.orders for all using (true);
create policy "Allow all order_items" on public.order_items for all using (true);
create policy "Allow all cart operations" on public.cart for all using (true);

-- Políticas seguras para cart: solo el dueño puede ver y modificar
create policy "Cart: solo dueño puede operar" on public.cart 
  for all
  using (auth.uid()::uuid = user_id);

-- Políticas seguras para cart_temp: solo acceso por session_id
create policy "CartTemp: solo por session_id" on public.cart_temp
  for all
  using (session_id = current_setting('request.jwt.claim.session_id', true));

-- Permitir SELECT a todos los productos del carrito temporal para pruebas (opcional, quitar en producción)
create policy "CartTemp: select abierto" on public.cart_temp for select using (true);

create policy "Allow all select users" on public.users for select using (true);

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

create policy "Allow all cart operations" on public.cart for all using (true);


create table public.reviews (
  id_reviews uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  comment text not null,
  rating integer check (rating >= 1 and rating <= 5),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Habilitar RLS para reviews
alter table public.reviews enable row level security;

-- Política para permitir a los usuarios operar solo sobre sus propias reseñas
create policy "Reviews: solo dueño puede operar" on public.reviews
  for all
  using (auth.uid()::uuid = user_id);

-- Permitir SELECT a todos para reviews (opcional, útil para mostrar reseñas públicas)
create policy "Allow all select reviews" on public.reviews for select using (true);
CREATE POLICY "Allow all insert reviews" ON public.reviews
  FOR INSERT
  WITH CHECK (true);