export default function handler(_request, response) {
  response.status(200).json({
    service: 'hoomko-commerce-ops',
    status: 'ok',
    stack: ['React', 'Vite', 'Vercel Functions'],
    capabilities: ['orders-api', 'operations-report', 'payment-diagnostics'],
  })
}
