import { cookies } from 'next/headers'

export async function isAdmin(): Promise<boolean> {
  const jar = await cookies()
  return jar.get('admin')?.value === 'true'
}
