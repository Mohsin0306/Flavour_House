"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createRestaurant,
  createMenuItem,
  deleteRestaurant,
  deleteMenuItem,
  getAdminMenu,
  getAdminRestaurants,
  type Restaurant,
  type MenuItem,
} from "@/lib/api";
import { getAdminToken } from "@/lib/admin-auth";

const emptyForm = {
  name: "",
  description: "",
  address: "",
  phone: "",
  image_url: "",
  latitude: "",
  longitude: "",
  cuisine: "",
};

export default function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [menus, setMenus] = useState<Record<number, MenuItem[]>>({});
  const [menuForm, setMenuForm] = useState({ name: "", price: "", category: "Main", description: "" });

  const token = getAdminToken()!;

  const load = useCallback(async () => {
    try {
      const data = await getAdminRestaurants(token);
      setRestaurants(data.restaurants);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createRestaurant(token, {
      name: form.name,
      description: form.description || undefined,
      address: form.address,
      phone: form.phone || undefined,
      image_url: form.image_url || undefined,
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      cuisine: form.cuisine || undefined,
    });
    setForm(emptyForm);
    setShowForm(false);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this restaurant?")) return;
    await deleteRestaurant(token, id);
    load();
  };

  const toggleMenu = async (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (!menus[id]) {
      const data = await getAdminMenu(token, id);
      setMenus((prev) => ({ ...prev, [id]: data.menu }));
    }
  };

  const addMenuItem = async (restaurantId: number) => {
    if (!menuForm.name || !menuForm.price) return;
    await createMenuItem(token, restaurantId, {
      name: menuForm.name,
      price: Number(menuForm.price),
      category: menuForm.category,
      description: menuForm.description || undefined,
    });
    const data = await getAdminMenu(token, restaurantId);
    setMenus((prev) => ({ ...prev, [restaurantId]: data.menu }));
    setMenuForm({ name: "", price: "", category: "Main", description: "" });
  };

  const removeMenuItem = async (restaurantId: number, itemId: number) => {
    await deleteMenuItem(token, itemId);
    const data = await getAdminMenu(token, restaurantId);
    setMenus((prev) => ({ ...prev, [restaurantId]: data.menu }));
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Restaurants</h1>
          <p className="text-gray-500 mt-1">Add restaurants and manage menu items</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
        >
          {showForm ? "Cancel" : "+ Add Restaurant"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mt-6 grid gap-4 rounded-xl bg-white p-6 shadow-sm sm:grid-cols-2">
          {(["name", "address", "phone", "cuisine", "image_url", "latitude", "longitude"] as const).map(
            (field) => (
              <div key={field} className={field === "name" || field === "address" ? "" : ""}>
                <label className="block text-xs font-medium text-gray-600 capitalize">
                  {field.replace("_", " ")}
                </label>
                <input
                  required={["name", "address", "latitude", "longitude"].includes(field)}
                  value={form[field]}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>
            )
          )}
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-600">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              rows={2}
            />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="rounded-lg bg-gray-900 px-6 py-2 text-sm text-white">
              Save Restaurant
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="mt-8 text-gray-500">Loading...</p>
      ) : (
        <div className="mt-8 space-y-4">
          {restaurants.map((r) => (
            <div key={r.id} className="rounded-xl bg-white shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-5">
                <div>
                  <h3 className="font-semibold text-gray-900">{r.name}</h3>
                  <p className="text-sm text-gray-500">{r.address}</p>
                  <p className="text-xs text-gray-400 mt-1 font-mono">
                    {r.latitude}, {r.longitude} · {r.menu_count} menu items
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleMenu(r.id)}
                    className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
                  >
                    Menu
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {expandedId === r.id && (
                <div className="border-t bg-gray-50 p-5">
                  <p className="text-sm font-medium text-gray-700 mb-3">Menu Items</p>
                  <ul className="space-y-2 mb-4">
                    {(menus[r.id] || []).map((item) => (
                      <li key={item.id} className="flex justify-between text-sm bg-white rounded-lg px-3 py-2">
                        <span>
                          {item.name} — PKR {item.price.toLocaleString("en-PK")} ({item.category})
                        </span>
                        <button
                          onClick={() => removeMenuItem(r.id, item.id)}
                          className="text-red-500 text-xs"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-2">
                    <input
                      placeholder="Item name"
                      value={menuForm.name}
                      onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                      className="rounded border px-2 py-1 text-sm"
                    />
                    <input
                      placeholder="Price"
                      type="number"
                      value={menuForm.price}
                      onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })}
                      className="rounded border px-2 py-1 text-sm w-24"
                    />
                    <input
                      placeholder="Category"
                      value={menuForm.category}
                      onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })}
                      className="rounded border px-2 py-1 text-sm w-28"
                    />
                    <button
                      type="button"
                      onClick={() => addMenuItem(r.id)}
                      className="rounded bg-orange-600 px-3 py-1 text-sm text-white"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
