import { redirect } from 'next/navigation'

export default function BlogAdminRedirect() {
  redirect('/admin?tab=blog')
}
