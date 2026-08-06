const request = async (path, options = {}) => {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });
  if (!response.ok)
    throw new Error(
      (await response.json().catch(() => null))?.error || "请求失败",
    );
  return response.json();
};

const sessionKey = "playmate-demo-session";

export const getSession = async (role = "buyer") => {
  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem(sessionKey) || "null");
  } catch {
    localStorage.removeItem(sessionKey);
  }
  if (saved?.user?.role === role && saved.token) return saved;
  const session = await request("/auth/demo-login", {
    method: "POST",
    body: JSON.stringify({ role }),
  });
  localStorage.setItem(sessionKey, JSON.stringify(session));
  return session;
};

const authorizedRequest = async (path, options = {}, role = "buyer") => {
  const session = await getSession(role);
  return request(path, {
    ...options,
    headers: { Authorization: `Bearer ${session.token}`, ...options.headers },
  });
};

export const apiHealth = () => request("/health");

export const listOrders = (buyerId = "buyer_demo") =>
  request(`/orders?buyerId=${encodeURIComponent(buyerId)}`);

export const createOrder = (service) =>
  request("/orders", {
    method: "POST",
    body: JSON.stringify({
      buyerId: "buyer_demo",
      serviceName: service.name || service.title,
      storeName: service.shop,
      amount: Number(service.price),
    }),
  });

export const payOrder = (orderId) =>
  authorizedRequest(`/orders/${orderId}/pay`, { method: "POST" }, "buyer");

export const cancelOrder = (orderId) =>
  authorizedRequest(`/orders/${orderId}/cancel`, { method: "POST" }, "buyer");

export const createDispute = (orderId, payload) =>
  authorizedRequest(
    `/orders/${orderId}/disputes`,
    { method: "POST", body: JSON.stringify(payload) },
    "buyer",
  );

export const listDisputes = () => authorizedRequest("/disputes", {}, "admin");

export const resolveDispute = (disputeId, payload) =>
  authorizedRequest(
    `/disputes/${disputeId}/resolve`,
    { method: "POST", body: JSON.stringify(payload) },
    "admin",
  );

export const listStoreApplications = () =>
  authorizedRequest("/admin/store-applications", {}, "admin");

export const reviewStoreApplication = (applicationId, decision) =>
  authorizedRequest(
    `/admin/store-applications/${applicationId}/review`,
    { method: "POST", body: JSON.stringify({ decision }) },
    "admin",
  );

export const submitPlayerVerification = (payload) =>
  authorizedRequest(
    "/player/verification",
    { method: "POST", body: JSON.stringify(payload) },
    "player",
  );

export const listPlayerVerifications = () =>
  authorizedRequest("/admin/player-verifications", {}, "admin");

export const reviewPlayerVerification = (verificationId, decision) =>
  authorizedRequest(
    `/admin/player-verifications/${verificationId}/review`,
    { method: "POST", body: JSON.stringify({ decision }) },
    "admin",
  );

export const listAdminAds = () => authorizedRequest("/admin/ads", {}, "admin");

export const reviewAdvertisement = (adId, decision) =>
  authorizedRequest(
    `/admin/ads/${adId}/review`,
    { method: "POST", body: JSON.stringify({ decision }) },
    "admin",
  );

export const listLedger = () => authorizedRequest("/admin/ledger", {}, "admin");

export const listAuditLogs = () =>
  authorizedRequest("/admin/audit-logs", {}, "admin");

export const createViolation = (payload) =>
  authorizedRequest(
    "/admin/violations",
    { method: "POST", body: JSON.stringify(payload) },
    "admin",
  );

export const openSupportConversation = (storeId) =>
  authorizedRequest("/support/conversations", {
    method: "POST",
    body: JSON.stringify({ storeId }),
  });

export const listSupportMessages = (conversationId) =>
  authorizedRequest(`/support/conversations/${conversationId}/messages`);

export const sendSupportMessage = (conversationId, message) =>
  authorizedRequest(`/support/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify(message),
  });

export const uploadVoice = async (blob, role = "buyer") => {
  const form = new FormData();
  form.append("audio", blob, "voice-message.webm");
  return authorizedRequest("/audio", { method: "POST", body: form }, role);
};

const connectConversation = async (
  conversationId,
  onMessage,
  onStatus,
  role,
) => {
  const session = await getSession(role);
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const socket = new WebSocket(
    `${protocol}//${window.location.host}/ws?token=${encodeURIComponent(session.token)}`,
  );
  socket.addEventListener("open", () => {
    socket.send(JSON.stringify({ action: "subscribe", conversationId }));
    onStatus?.("online");
  });
  socket.addEventListener("message", (event) => {
    const payload = JSON.parse(event.data);
    if (payload.type === "message") onMessage(payload.message);
  });
  socket.addEventListener("close", () => onStatus?.("offline"));
  socket.addEventListener("error", () => onStatus?.("offline"));
  return socket;
};

export const connectSupportConversation = (
  conversationId,
  onMessage,
  onStatus,
) => connectConversation(conversationId, onMessage, onStatus, "buyer");

export const listMerchantConversations = () =>
  authorizedRequest("/support/conversations", {}, "merchant");

export const listMerchantMessages = (conversationId) =>
  authorizedRequest(
    `/support/conversations/${conversationId}/messages`,
    {},
    "merchant",
  );

export const sendMerchantSupportMessage = (conversationId, message) =>
  authorizedRequest(
    `/support/conversations/${conversationId}/messages`,
    { method: "POST", body: JSON.stringify(message) },
    "merchant",
  );

export const connectMerchantConversation = (
  conversationId,
  onMessage,
  onStatus,
) => connectConversation(conversationId, onMessage, onStatus, "merchant");

export const getPlayerDashboard = () =>
  authorizedRequest("/player/dashboard", {}, "player");

export const updatePlayerStatus = (status) =>
  authorizedRequest(
    "/player/status",
    { method: "PATCH", body: JSON.stringify({ status }) },
    "player",
  );

export const updatePlayerProfile = (profile) =>
  authorizedRequest(
    "/player/profile",
    { method: "PATCH", body: JSON.stringify(profile) },
    "player",
  );

export const transitionPlayerOrder = (orderId, action) =>
  authorizedRequest(
    `/player/orders/${orderId}/${action}`,
    { method: "POST" },
    "player",
  );
