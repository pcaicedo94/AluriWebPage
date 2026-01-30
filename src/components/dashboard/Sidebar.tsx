import Image from 'next/image'
import SidebarNav from './SidebarNav'
import UserInfo from './UserInfo'

interface SidebarProps {
  user: {
    name: string
    email: string
  }
}

export default function Sidebar({ user }: SidebarProps) {
  return (
    <aside className="hidden lg:flex w-64 h-screen bg-black border-r border-zinc-800 flex-col fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="p-6 border-b border-zinc-800">
        <Image
          src="/images/AluriLogoBlackBG.png"
          alt="Aluri"
          width={100}
          height={40}
          className="h-8 w-auto"
        />
      </div>

      {/* Navigation */}
      <SidebarNav />

      {/* User Info */}
      <UserInfo name={user.name} email={user.email} />
    </aside>
  )
}
