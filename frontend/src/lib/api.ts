/** Same-origin API — works locally and on Vercel (no separate backend). */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export type Coordinates = {
  latitude: number;
  longitude: number;
  accuracy?: number;
};

export type Restaurant = {
  id: number;
  name: string;
  description: string | null;
  address: string;
  city?: string | null;
  phone: string | null;
  image_url: string | null;
  latitude: number;
  longitude: number;
  cuisine: string | null;
  is_active: boolean;
  menu_count?: number;
  distance_km?: number;
};

export type OrderItemLine = {
  id: number;
  menu_item_id: number | null;
  item_name: string;
  item_price: number;
  quantity: number;
};

export type Order = {
  id: number;
  order_number: string;
  restaurant_id: number;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  notes: string | null;
  status: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  created_at: string;
  branch_name: string;
  branch_city: string | null;
  branch_address: string;
  branch_phone: string | null;
  items: OrderItemLine[];
};

export type MenuItem = {
  id: number;
  restaurant_id: number;
  name: string;
  description: string | null;
  price: number;
  category: string;
  is_available: number;
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  let data: { error?: string } & T;
  try {
    data = await res.json();
  } catch {
    throw new Error(res.ok ? "Invalid server response" : `Server error (${res.status})`);
  }
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export async function saveLocation(coords: Coordinates) {
  return request<{ success: boolean; coordinates: Coordinates }>("/api/location", {
    method: "POST",
    body: JSON.stringify(coords),
  });
}

export async function getRestaurants(lat?: number, lng?: number) {
  const params = new URLSearchParams();
  if (lat != null && lng != null) {
    params.set("lat", String(lat));
    params.set("lng", String(lng));
    params.set("radius", "100");
  }
  const q = params.toString();
  return request<{ restaurants: Restaurant[] }>(`/api/restaurants${q ? `?${q}` : ""}`);
}

export async function getRestaurant(id: number) {
  return request<{ restaurant: Restaurant; menu: MenuItem[] }>(`/api/restaurants/${id}`);
}

export async function adminLogin(email: string, password: string) {
  return request<{ token: string; admin: { id: number; email: string; name: string } }>(
    "/api/auth/login",
    { method: "POST", body: JSON.stringify({ email, password }) }
  );
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export async function getAdminStats(token: string) {
  return request<{
    restaurants: number;
    menuItems: number;
    locations: number;
    recentLocations: Array<{
      latitude: number;
      longitude: number;
      accuracy: number | null;
      created_at: string;
    }>;
  }>("/api/admin/stats", { headers: authHeaders(token) });
}

export async function getAdminRestaurants(token: string) {
  return request<{ restaurants: Restaurant[] }>("/api/admin/restaurants", {
    headers: authHeaders(token),
  });
}

export async function createRestaurant(token: string, data: Partial<Restaurant>) {
  return request<{ restaurant: Restaurant }>("/api/admin/restaurants", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function updateRestaurant(token: string, id: number, data: Partial<Restaurant>) {
  return request<{ restaurant: Restaurant }>(`/api/admin/restaurants/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function deleteRestaurant(token: string, id: number) {
  return request<{ success: boolean }>(`/api/admin/restaurants/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

export async function getAdminMenu(token: string, restaurantId: number) {
  return request<{ menu: MenuItem[] }>(`/api/admin/restaurants/${restaurantId}/menu`, {
    headers: authHeaders(token),
  });
}

export async function createMenuItem(
  token: string,
  restaurantId: number,
  data: { name: string; description?: string; price: number; category?: string }
) {
  return request<{ item: MenuItem }>(`/api/admin/restaurants/${restaurantId}/menu`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function deleteMenuItem(token: string, id: number) {
  return request<{ success: boolean }>(`/api/admin/menu/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

export async function createOrder(payload: {
  restaurant_id: number;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  notes?: string;
  items: { menu_item_id: number; quantity: number }[];
}) {
  return request<{ order: Order }>("/api/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getOrder(id: number) {
  return request<{ order: Order }>(`/api/orders/${id}`);
}
