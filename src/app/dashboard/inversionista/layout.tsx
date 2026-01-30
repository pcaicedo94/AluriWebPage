import { createClient } from '../../../utils/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '../../../components/dashboard/Sidebar'
import MobileSidebar from '../../../components/dashboard/MobileSidebar'

export default async function InversionistaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  // Fetch user profile for name
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const userName = profile?.full_name || user.user_metadata?.full_name || ''
  const userEmail = user.email || ''

  return (
    <div className="min-h-screen bg-black">
      {/* Desktop sidebar */}
      <Sidebar user={{ name: userName, email: userEmail }} />

      {/* Mobile sidebar */}
      <MobileSidebar user={{ name: userName, email: userEmail }} />

      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  )
}
