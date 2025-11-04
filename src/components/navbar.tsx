"use client"

import * as React from "react"
import Link from "next/link"
import { GalleryVerticalEnd, User, LogOut, Plus } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b glass-strong p-4">
      <div className="flex items-center">
        <div className="mr-4 flex items-center gap-2">
          <SidebarTrigger className="mr-2" />
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <GalleryVerticalEnd className="h-5 w-5" />
            <span className="font-bold text-lg">Memory Lane</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          {user ? (
            <>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="text-sm">{user.email}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 py-2" align="end">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={signOut}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </PopoverContent>
              </Popover>
            </>
          ) : (
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar

