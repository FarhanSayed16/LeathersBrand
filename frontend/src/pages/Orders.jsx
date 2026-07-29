import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { toast } from "react-toastify";
import axios from "axios";

const Orders = () => {
  const { formatPrice, token, backendUrl, delivery_fee } =
    useContext(ShopContext);

  const trackingStages = [
    "OrderPlaced",
    "Packing",
    "Shipped",
    "OutForDelivery",
    "Delivered",
  ];

  const [orders, setOrders] = useState([]);

  // 🔹 Cancel popup state
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [returnBusyId, setReturnBusyId] = useState(null);

  // ================= LOAD ORDERS =================
  const loadOrderData = async () => {
    try {
      if (!token) return;

      const res = await axios.post(
        backendUrl + "/api/order/userorders",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        setOrders(res.data.orders.reverse());
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to load orders");
    }
  };

  // ================= OPEN CANCEL MODAL =================
  const openCancelModal = (orderId, item) => {
    setSelectedItem({
      orderId,
      itemId: item._id,
      size: item.size,
    });
    setShowModal(true);
  };

  // ================= CONFIRM CANCEL =================
  const confirmCancel = async () => {
    try {
      const res = await axios.post(
        backendUrl + "/api/order/cancel",
        selectedItem,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        toast.success("Item cancelled successfully");
        loadOrderData();
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Cancel failed");
    } finally {
      setShowModal(false);
      setSelectedItem(null);
    }
  };

  const requestReturn = async (orderId) => {
    const reason = window.prompt("Why are you returning this order? (optional)") || "";
    setReturnBusyId(orderId);
    try {
      const res = await axios.post(
        `${backendUrl}/api/shipping/shiprocket/return/request/${orderId}`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success(res.data.message || "Return requested");
        loadOrderData();
      } else {
        toast.error(res.data.message || "Return request failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Return request failed");
    } finally {
      setReturnBusyId(null);
    }
  };

  const canRequestReturn = (order) => {
    const hasDelivered = (order.items || []).some((i) => i.status === "Delivered");
    if (!hasDelivered) return false;
    if (order.shipping?.return?.requested) return false;
    if (order.items.some((i) => ["ReturnRequested", "ReturnInTransit", "Returned"].includes(i.status))) {
      return false;
    }
    return true;
  };

  useEffect(() => {
    loadOrderData();
  }, [token]);

  return (
    <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[8vw] pt-10 border-t">
      <div className="text-2xl mb-4">
        <Title text1="MY" text2="ORDERS" />
      </div>

      {orders.length === 0 ? (
        <p className="text-center text-gray-500 mt-12">
          No orders found.
        </p>
      ) : (
        orders.map((order) => (
          <div
            key={order._id}
            className="mb-6 border border-gray-300 rounded-lg shadow-sm p-4"
          >
            {/* Order Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
              <p className="text-sm font-semibold text-gray-700">
                Address: {order.address.street}, {order.address.city},{" "}
                {order.address.state}, {order.address.zipcode}
              </p>
              <div className="flex flex-col sm:items-end gap-1">
                <p className="text-sm text-gray-500">
                  Placed on:{" "}
                  {new Date(order.date).toLocaleDateString()}
                </p>
                {order.shipping?.trackingUrl && (
                  <a
                    href={order.shipping.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm font-semibold text-tz-navy underline underline-offset-2 hover:text-tz-pink"
                  >
                    Track shipment
                    {order.shipping.awbCode
                      ? ` · ${order.shipping.awbCode}`
                      : ""}
                  </a>
                )}
                {order.shipping?.courierName && !order.shipping?.trackingUrl && (
                  <p className="text-xs text-gray-500">
                    Courier: {order.shipping.courierName}
                  </p>
                )}
                {order.shipping?.return?.trackingUrl && (
                  <a
                    href={order.shipping.return.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-tz-navy underline underline-offset-2"
                  >
                    Track return
                  </a>
                )}
                {canRequestReturn(order) && (
                  <button
                    type="button"
                    onClick={() => requestReturn(order._id)}
                    disabled={returnBusyId === order._id}
                    className="text-xs border border-tz-navy/30 text-tz-navy px-3 py-1 rounded hover:bg-tz-cream disabled:opacity-60"
                  >
                    {returnBusyId === order._id ? "Requesting…" : "Request return"}
                  </button>
                )}
                {order.shipping?.return?.requested && !order.shipping?.return?.awbCode && (
                  <p className="text-xs text-amber-700">Return requested — awaiting approval</p>
                )}
              </div>
            </div>

            {/* Items */}
            {order.items.map((item) => {
              const currentIndex = trackingStages.includes(item.status)
                ? trackingStages.indexOf(item.status)
                : -1;

              return (
                <div
                  key={item._id + item.size}
                  className="py-4 border-t flex flex-col md:flex-row gap-6"
                >
                  <div className="flex gap-4 w-full md:w-[35%]">
                    <img
                      src={item?.image?.[0] || "/brand/product-placeholder.jpg"}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div>
                      <p className="font-semibold text-base sm:text-lg">
                        {item.name}
                      </p>

                      <p className="text-sm text-gray-600 mt-1">
                        Price: {formatPrice(item.price * item.quantity)}
                      </p>

                      <p className="text-sm text-gray-600 mt-1">
                        Quantity: {item.quantity} | Size:{" "}
                        {item.size}
                      </p>

                      <p className="text-sm text-gray-500 mt-2">
                        Payment: {order.paymentMethod}
                        {order.paymentMethod === "Partial" && order.paymentDetails ? (
                          <>
                            {" · "}
                            advance {formatPrice(order.paymentDetails.advanceAmount)}
                            {order.paymentDetails.advanceRefunded
                              ? " (refunded)"
                              : order.paymentDetails.advanceKeptOnRto
                                ? " (retained on RTO)"
                              : order.paymentDetails.balancePaid
                                ? " (fully paid)"
                                : ` · balance ${formatPrice(order.paymentDetails.balanceAmount)} on delivery`}
                          </>
                        ) : null}
                      </p>

                      {order.shipping?.trackingUrl && (
                        <a
                          href={order.shipping.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-2 text-sm font-medium text-tz-navy underline underline-offset-2"
                        >
                          Track package
                          {order.shipping.courierName
                            ? ` (${order.shipping.courierName})`
                            : ""}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Status & Cancel */}
                  <div className="flex flex-col gap-4 w-full md:w-[65%]">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-3 h-3 rounded-full ${
                            item.status === "Delivered"
                              ? "bg-green-500"
                              : item.status === "Cancelled"
                              ? "bg-red-500"
                              : "bg-yellow-500"
                          }`}
                        ></span>
                        <p className="text-sm">{item.status}</p>
                      </div>

                      {item.status !== "Delivered" &&
                        item.status !== "Cancelled" && (
                          <button
                            onClick={() =>
                              openCancelModal(order._id, item)
                            }
                            className="text-xs text-red-600 border border-red-600 px-3 py-1 rounded hover:bg-red-100"
                          >
                            Cancel Item
                          </button>
                        )}
                    </div>

                    {/* Tracking */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center">
                        {trackingStages.map((stage, i) => {
                          const isCompleted =
                            i <= currentIndex &&
                            item.status !== "Cancelled";

                          return (
                            <div
                              key={i}
                              className="flex items-center flex-1"
                            >
                              <div
                                className={`w-4 h-4 rounded-full border-2 ${
                                  item.status === "Cancelled"
                                    ? "bg-red-500 border-red-500"
                                    : isCompleted
                                    ? "bg-green-500 border-green-500"
                                    : "bg-white border-gray-400"
                                }`}
                              ></div>
                              {i <
                                trackingStages.length - 1 && (
                                <div
                                  className={`flex-1 h-1 ${
                                    isCompleted
                                      ? "bg-green-500"
                                      : "bg-gray-300"
                                  }`}
                                ></div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex justify-between text-[10px] text-gray-500">
                        {trackingStages.map((stage) => (
                          <span
                            key={stage}
                            className="w-[20%] text-center"
                          >
                            {stage}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))
      )}

      {/* ================= CONFIRMATION MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-[90%] max-w-md shadow-xl text-center">
            <h2 className="text-lg font-semibold mb-3">
              Cancel this item?
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to cancel this order item?
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={confirmCancel}
                className="bg-red-600 text-white px-5 py-2 rounded hover:bg-red-700"
              >
                Yes, Cancel
              </button>

              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 px-5 py-2 rounded hover:bg-gray-400"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;