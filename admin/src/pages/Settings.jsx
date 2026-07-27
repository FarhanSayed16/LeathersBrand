import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import brand from "../brand";

const defaultSettings = {
  deliveryFee: 50,
  freeShippingThreshold: 999,
  codEnabled: true,
  partialPayment: {
    active: true,
    percent: 20,
    label: "Pay advance now, rest on delivery",
    policyNotice:
      "Paying an advance now reserves your order and helps cover logistics. If the parcel is refused or returned undelivered, the advance may be retained as per our policy. The remaining amount is payable only on successful delivery.",
    replaceCod: true,
    keepAdvanceOnRto: true,
    minAdvanceAmount: 50,
  },
  homeConfig: {
    showHero: true,
    showCategories: true,
    showNewArrivals: true,
    showBestSellers: true,
    showInstagram: true,
    showReviews: true,
    newArrivalsTitle: "NEW ARRIVALS",
    bestSellersTitle: "TOP BEST SELLERS",
    featuredProductIds: [],
  },
  categoryTiles: [
    {
      label: "Men",
      link: "/shop?department=men",
      image: brand.media?.categories?.men || "/brand/categories/men.jpg",
      order: 0,
    },
    {
      label: "Women",
      link: "/shop?department=women",
      image: brand.media?.categories?.women || "/brand/categories/women.jpg",
      order: 1,
    },
    {
      label: "Bags",
      link: "/shop?department=bags",
      image: brand.media?.categories?.bags || "/brand/categories/bags.jpg",
      order: 2,
    },
    {
      label: "Accessories",
      link: "/shop?department=accessories",
      image: brand.media?.categories?.accessories || "/brand/categories/accessories.jpg",
      order: 3,
    },
  ],
  promoStrip: {
    isActive: true,
    message: "FREE SHIPPING ON ORDERS OVER ₹999 — AFIYA LEATHERS",
    link: "/shop",
  },
  aboutConfig: {
    heroVideo: "",
  },
};

const Settings = () => {
  const [settings, setSettings] = useState(defaultSettings);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const library = brand.media?.library || [];

  useEffect(() => {
    fetchSettings();
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/product/list`);
      if (res.data.success) setProducts(res.data.products || []);
    } catch {
      /* ignore */
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/settings`);
      if (res.data.success && res.data.settings) {
        const s = res.data.settings;
        const tiles =
          s.categoryTiles?.length > 0
            ? s.categoryTiles.map((tile, i) => ({
                ...tile,
                image:
                  tile.image ||
                  defaultSettings.categoryTiles[i]?.image ||
                  brand.media?.placeholder ||
                  "",
              }))
            : defaultSettings.categoryTiles;

        setSettings((prev) => ({
          ...prev,
          ...s,
          homeConfig: {
            ...prev.homeConfig,
            ...(s.homeConfig || {}),
            featuredProductIds: s.homeConfig?.featuredProductIds || [],
          },
          categoryTiles: tiles,
          promoStrip: { ...prev.promoStrip, ...(s.promoStrip || {}) },
          aboutConfig: { ...prev.aboutConfig, ...(s.aboutConfig || {}) },
          partialPayment: {
            ...prev.partialPayment,
            ...(s.partialPayment || {}),
          },
          partialPaymentConfig: s.partialPaymentConfig || null,
        }));
      }
    } catch {
      toast.error("Failed to fetch settings");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;

    if (name.startsWith("homeConfig.")) {
      const key = name.split(".")[1];
      setSettings((prev) => ({
        ...prev,
        homeConfig: { ...prev.homeConfig, [key]: val },
      }));
    } else if (name.startsWith("promoStrip.")) {
      const key = name.split(".")[1];
      setSettings((prev) => ({
        ...prev,
        promoStrip: { ...prev.promoStrip, [key]: val },
      }));
    } else if (name.startsWith("aboutConfig.")) {
      const key = name.split(".")[1];
      setSettings((prev) => ({
        ...prev,
        aboutConfig: { ...prev.aboutConfig, [key]: val },
      }));
    } else if (name.startsWith("partialPayment.")) {
      const key = name.split(".")[1];
      setSettings((prev) => ({
        ...prev,
        partialPayment: { ...prev.partialPayment, [key]: val },
      }));
    } else {
      setSettings((prev) => ({ ...prev, [name]: val }));
    }
  };

  const toggleFeaturedId = (id) => {
    setSettings((prev) => {
      const ids = prev.homeConfig.featuredProductIds || [];
      const next = ids.includes(id)
        ? ids.filter((x) => x !== id)
        : [...ids, id];
      return {
        ...prev,
        homeConfig: { ...prev.homeConfig, featuredProductIds: next },
      };
    });
  };

  const updateTile = (index, field, value) => {
    setSettings((prev) => {
      const tiles = [...(prev.categoryTiles || [])];
      tiles[index] = { ...tiles[index], [field]: value };
      return { ...prev, categoryTiles: tiles };
    });
  };

  const addTile = () => {
    setSettings((prev) => ({
      ...prev,
      categoryTiles: [
        ...(prev.categoryTiles || []),
        {
          label: "New tile",
          link: "/shop",
          image: brand.media?.placeholder || "",
          order: prev.categoryTiles?.length || 0,
        },
      ],
    }));
  };

  const removeTile = (index) => {
    setSettings((prev) => ({
      ...prev,
      categoryTiles: (prev.categoryTiles || []).filter((_, i) => i !== index),
    }));
  };

  const applyBrandDefaults = () => {
    setSettings((prev) => ({
      ...prev,
      categoryTiles: defaultSettings.categoryTiles,
    }));
    toast.info(`Category tiles reset to ${brand.name} brand images — click Save`);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${backendUrl}/api/settings`, settings, {
        headers: { token: localStorage.getItem("token") },
      });
      if (res.data.success) toast.success("Settings updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <h2 className="text-3xl font-bold text-tz-navy font-brand">Site Settings</h2>
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-tz-navy text-white px-6 py-2 rounded-xl font-medium hover:bg-tz-pink disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Settings"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-tz-pink-soft space-y-6">
          <h3 className="text-xl font-bold border-b pb-4 text-tz-navy">Commerce</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Fee (₹)</label>
              <input type="number" name="deliveryFee" value={settings.deliveryFee} onChange={handleChange} className="w-full border p-2.5 rounded-xl" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Free Shipping Threshold (₹)</label>
              <input type="number" name="freeShippingThreshold" value={settings.freeShippingThreshold} onChange={handleChange} className="w-full border p-2.5 rounded-xl" />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <input type="checkbox" name="codEnabled" id="codEnabled" checked={settings.codEnabled} onChange={handleChange} className="w-5 h-5 rounded" />
              <label htmlFor="codEnabled" className="text-sm font-medium cursor-pointer">Enable Cash on Delivery (COD)</label>
            </div>
          </div>

          <div className="border-t pt-5 space-y-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h4 className="font-bold text-tz-navy">Partial payment (advance)</h4>
                <p className="text-xs text-gray-500 mt-1">
                  Collect a % upfront via Razorpay; rest on delivery.
                </p>
              </div>
              {settings.partialPaymentConfig?.envEnabled ? (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#89c9b8]/25 text-[#2f6f62]">
                  Env: ON
                </span>
              ) : (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                  Env: OFF — set PARTIAL_PAYMENT_ENABLED=true
                </span>
              )}
            </div>

            {!settings.partialPaymentConfig?.envEnabled && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl p-3">
                Master switch is off in <code>backend/.env</code>. Turn it on and restart the API before this section affects checkout.
              </p>
            )}

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="partialPayment.active"
                id="partialActive"
                checked={settings.partialPayment?.active !== false}
                onChange={handleChange}
                disabled={!settings.partialPaymentConfig?.envEnabled}
                className="w-5 h-5 rounded"
              />
              <label htmlFor="partialActive" className="text-sm font-medium cursor-pointer">
                Active in storefront (when env is ON)
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Advance percent (%)
                {settings.partialPaymentConfig && (
                  <span className="text-gray-400 font-normal">
                    {" "}
                    · allowed {settings.partialPaymentConfig.minPercent}–
                    {settings.partialPaymentConfig.maxPercent}
                  </span>
                )}
              </label>
              <input
                type="number"
                name="partialPayment.percent"
                min={settings.partialPaymentConfig?.minPercent || 10}
                max={settings.partialPaymentConfig?.maxPercent || 50}
                value={settings.partialPayment?.percent ?? 20}
                onChange={handleChange}
                disabled={!settings.partialPaymentConfig?.envEnabled}
                className="w-full border p-2.5 rounded-xl disabled:bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">
                Preview on ₹2000 order → advance ₹
                {Math.round((2000 * Number(settings.partialPayment?.percent || 20)) / 100)}
                , balance ₹
                {2000 - Math.round((2000 * Number(settings.partialPayment?.percent || 20)) / 100)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Checkout label</label>
              <input
                type="text"
                name="partialPayment.label"
                value={settings.partialPayment?.label || ""}
                onChange={handleChange}
                disabled={!settings.partialPaymentConfig?.envEnabled}
                className="w-full border p-2.5 rounded-xl disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Policy notice (checkout)</label>
              <textarea
                name="partialPayment.policyNotice"
                rows={3}
                value={settings.partialPayment?.policyNotice || ""}
                onChange={handleChange}
                disabled={!settings.partialPaymentConfig?.envEnabled}
                className="w-full border p-2.5 rounded-xl text-sm disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum advance (₹)
              </label>
              <input
                type="number"
                name="partialPayment.minAdvanceAmount"
                min={0}
                value={settings.partialPayment?.minAdvanceAmount ?? 50}
                onChange={handleChange}
                disabled={!settings.partialPaymentConfig?.envEnabled}
                className="w-full border p-2.5 rounded-xl disabled:bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">
                If {settings.partialPayment?.percent ?? 20}% is below this floor, we charge at least this amount (or the full order if smaller).
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="partialPayment.replaceCod"
                id="replaceCod"
                checked={settings.partialPayment?.replaceCod !== false}
                onChange={handleChange}
                disabled={!settings.partialPaymentConfig?.envEnabled}
                className="w-5 h-5 rounded"
              />
              <label htmlFor="replaceCod" className="text-sm font-medium cursor-pointer">
                Replace classic COD with Partial (recommended)
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-tz-blue-soft space-y-5">
          <h3 className="text-xl font-bold border-b pb-4 text-tz-navy">Homepage Layout</h3>
          {[
            ["showHero", "Show Hero Banners"],
            ["showCategories", "Show Category Tiles"],
            ["showNewArrivals", "Show Featured / New section"],
            ["showBestSellers", "Show Best Sellers"],
            ["showInstagram", "Show Instagram Section"],
            ["showReviews", "Show Reviews Section"],
          ].map(([key, label]) => (
            <div key={key} className="flex items-center justify-between">
              <label className="text-sm font-medium cursor-pointer">{label}</label>
              <input
                type="checkbox"
                name={`homeConfig.${key}`}
                checked={settings.homeConfig?.[key] !== false}
                onChange={handleChange}
                className="w-5 h-5 rounded"
              />
            </div>
          ))}
          <input type="text" name="homeConfig.newArrivalsTitle" value={settings.homeConfig.newArrivalsTitle || ""} onChange={handleChange} placeholder="Featured section title" className="w-full border p-2 text-sm rounded-xl" />
          <input type="text" name="homeConfig.bestSellersTitle" value={settings.homeConfig.bestSellersTitle || ""} onChange={handleChange} placeholder="Bestsellers title" className="w-full border p-2 text-sm rounded-xl" />
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-tz-pink-soft space-y-4">
          <h3 className="text-xl font-bold border-b pb-4 text-tz-navy">About Page</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hero Video / Image URL</label>
            <input type="text" name="aboutConfig.heroVideo" value={settings.aboutConfig?.heroVideo || ""} onChange={handleChange} placeholder="e.g. /brand/about-video.mp4 or URL" className="w-full border p-2.5 rounded-xl text-sm" />
            <p className="text-xs text-gray-500 mt-1">Leave empty to use the default brand video.</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border md:col-span-2 space-y-4">
          <h3 className="text-xl font-bold border-b pb-4 text-tz-navy">Featured Products (homepage)</h3>
          <p className="text-sm text-gray-500">Select products to show in the featured section. If none selected, newest products are shown.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
            {products.map((p) => {
              const checked = (settings.homeConfig.featuredProductIds || []).includes(p._id);
              return (
                <label key={p._id} className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer ${checked ? "border-tz-pink bg-tz-pink-soft" : "border-gray-100"}`}>
                  <input type="checkbox" checked={checked} onChange={() => toggleFeaturedId(p._id)} />
                  {p.image?.[0] ? (
                    <img src={p.image[0]} alt="" className="w-8 h-8 rounded object-cover" />
                  ) : null}
                  <span className="text-sm truncate">{p.name}</span>
                </label>
              );
            })}
            {products.length === 0 && <p className="text-sm text-gray-400">No products yet — run seed or add products.</p>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border md:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b pb-4 gap-3 flex-wrap">
            <h3 className="text-xl font-bold text-tz-navy">Category Tiles</h3>
            <div className="flex gap-2">
              <button type="button" onClick={applyBrandDefaults} className="text-sm bg-tz-pink-soft text-tz-navy px-3 py-1.5 rounded-lg">
                Use brand images
              </button>
              <button type="button" onClick={addTile} className="text-sm bg-tz-blue-soft text-tz-navy px-3 py-1.5 rounded-lg">
                + Add tile
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-500 pt-1 pb-2">
            <span className="font-semibold text-tz-navy">Tip:</span> For the perfect high-end editorial fit, upload images sized exactly <span className="font-bold">1200x900</span>.
          </p>

          {(settings.categoryTiles || []).map((tile, index) => (
            <div key={index} className="border border-tz-pink/15 p-4 rounded-2xl space-y-3">
              <div className="flex gap-4 items-start">
                <img
                  src={tile.image || brand.media?.placeholder}
                  alt={tile.label || "tile"}
                  className="w-24 h-24 rounded-xl object-cover border border-tz-pink/20 bg-tz-cream shrink-0"
                  onError={(e) => {
                    e.currentTarget.src = brand.media?.placeholder || "/brand/product-placeholder.jpg";
                  }}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">
                  <div>
                    <label className="text-xs font-medium">Label</label>
                    <input className="w-full border p-2 rounded-lg" value={tile.label || ""} onChange={(e) => updateTile(index, "label", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-medium">Link</label>
                    <input className="w-full border p-2 rounded-lg" value={tile.link || ""} onChange={(e) => updateTile(index, "link", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-medium">Image path / URL</label>
                    <input
                      className="w-full border p-2 rounded-lg text-sm"
                      value={tile.image || ""}
                      onChange={(e) => updateTile(index, "image", e.target.value)}
                      placeholder="/brand/categories/men.jpg"
                    />
                  </div>
                </div>
                <button type="button" onClick={() => removeTile(index)} className="text-sm text-red-600 py-2 shrink-0">
                  Remove
                </button>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-2">Quick pick from brand library</p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {library.map((item) => (
                    <button
                      key={item.path}
                      type="button"
                      title={item.label}
                      onClick={() => updateTile(index, "image", item.path)}
                      className={`shrink-0 rounded-lg overflow-hidden border-2 ${
                        tile.image === item.path ? "border-tz-pink" : "border-transparent hover:border-tz-pink/40"
                      }`}
                    >
                      <img src={item.path} alt={item.label} className="w-14 h-14 object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border md:col-span-2 space-y-4">
          <h3 className="text-xl font-bold border-b pb-4 text-tz-navy">Announcement Bar</h3>
          <div className="flex items-center gap-3">
            <input type="checkbox" name="promoStrip.isActive" id="promoStripActive" checked={settings.promoStrip?.isActive} onChange={handleChange} className="w-5 h-5 rounded" />
            <label htmlFor="promoStripActive" className="text-sm font-medium cursor-pointer">Show announcement bar</label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="promoStrip.message" value={settings.promoStrip?.message || ""} onChange={handleChange} disabled={!settings.promoStrip?.isActive} className="w-full border p-2.5 rounded-xl" />
            <input type="text" name="promoStrip.link" value={settings.promoStrip?.link || ""} onChange={handleChange} disabled={!settings.promoStrip?.isActive} placeholder="/shop" className="w-full border p-2.5 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
