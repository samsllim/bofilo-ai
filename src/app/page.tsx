import { Mail } from '@/app/mail/components/mail'
import { cookies } from 'next/headers'
import { ModeToggle } from "@/components/theme-toggle"
import { UserButton } from "@clerk/nextjs"
import ComposeButton from "@/app/mail/components/compose-button"

export default function Home() {

  const layout = cookies().get("react-resizable-panels:layout:mail")
  const collapsed = cookies().get("react-resizable-panels:collapsed")

  const defaultLayout = layout ? JSON.parse(layout.value) : undefined
  const defaultCollapsed = collapsed ? JSON.parse(collapsed.value) : undefined

  return (
    <>
      <div className="absolute bottom-4 left-4">
        <div className="flex items-center gap-4">
          <UserButton />
          <ModeToggle />
          <ComposeButton />
        </div>
      </div>

      <div className="flex-col hidden md:flex h-screen">
        <Mail
          defaultLayout={defaultLayout}
          defaultCollapsed={defaultCollapsed}
          navCollapsedSize={4}
        />
      </div>
    </>
  )
}
