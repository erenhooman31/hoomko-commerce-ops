import { databaseMode } from './_lib/supabase.js'

export default function handler(_request, response) {
  response.status(200).json({
    service: 'hoomko-commerce-ops',
    status: 'ok',
    database: databaseMode(),
    stack: ['React', 'Vite', 'Vercel Functions', 'Supabase-ready Postgres'],
    capabilities: ['orders-api', 'operations-report', 'payment-diagnostics', 'contact-intake'],
  })
}
