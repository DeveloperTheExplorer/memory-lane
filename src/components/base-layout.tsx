import Navbar from './navbar'
import Footer from './footer'
import { AppSidebar } from './app-sidebar'
import { SidebarInset, SidebarProvider } from './ui/sidebar'
import { Toaster } from './ui/sonner'

export default function BaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Toaster />
      <SidebarProvider
        style={
          {
            "--sidebar-width": "19rem",
          } as React.CSSProperties
        }>
        <AppSidebar />
        <SidebarInset>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </SidebarInset>
      </SidebarProvider>
    </>
  )
}