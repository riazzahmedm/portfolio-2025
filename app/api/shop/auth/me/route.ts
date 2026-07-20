import { getCustomer } from '@/lib/customer-auth'

export async function GET() {
  const customer = await getCustomer()
  if (!customer) return Response.json({ user: null })
  return Response.json({ user: customer })
}
