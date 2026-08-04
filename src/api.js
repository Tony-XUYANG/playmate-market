const request = async (path, options = {}) => {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  if (!response.ok) throw new Error((await response.json().catch(() => null))?.error || '请求失败');
  return response.json();
};

export const listOrders = (buyerId = 'buyer_demo') => request(`/orders?buyerId=${encodeURIComponent(buyerId)}`);

export const createOrder = service => request('/orders', {
  method: 'POST',
  body: JSON.stringify({
    buyerId: 'buyer_demo',
    serviceName: service.name || service.title,
    storeName: service.shop,
    amount: Number(service.price)
  })
});

export const apiHealth = () => request('/health');
