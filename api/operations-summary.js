const orders = [
  { id: 'WO-1048', channel: 'WooCommerce', value: 18400000, stage: 'ready_to_ship' },
  { id: 'SH-2091', channel: 'Shopify', value: 32600000, stage: 'review' },
  { id: 'MG-7712', channel: 'Magento', value: 12800000, stage: 'packing' },
  { id: 'WO-1051', channel: 'WooCommerce', value: 44200000, stage: 'paid' },
]

export default function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    response.status(405).json({ error: 'method_not_allowed' })
    return
  }

  const totalRevenue = orders.reduce((sum, order) => sum + order.value, 0)
  response.status(200).json({
    generatedAt: new Date().toISOString(),
    totalRevenue,
    orderCount: orders.length,
    pendingOrders: orders.filter((order) => order.stage !== 'ready_to_ship').length,
    criticalSignals: ['payment-callback-watch', 'stock-sync-lock', 'sms-retry-queue'],
    orders,
  })
}
