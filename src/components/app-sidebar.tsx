import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/router"
import { GalleryVerticalEnd, Home, Plus, Image } from "lucide-react"
import { useTimelinesWithMemoryCounts } from "@/hooks/use-timeline"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"

const SidebarSkeleton = () => {
  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarMenu className="gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <SidebarMenuItem key={i}>
              <div className="px-2 py-1.5">
                <Skeleton className="h-5 w-32 mb-2" />
                <div className="ml-4 space-y-1.5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const router = useRouter()
  const { data: timelines, isLoading } = useTimelinesWithMemoryCounts()

  // Helper to check if path is active
  const isActive = (path: string) => {
    return router.asPath === path || router.asPath.startsWith(path + '/')
  }

  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">Memory Lane</span>
                  <span className="text-xs">Timelines</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {isLoading ? (
        <SidebarSkeleton />
      ) : (
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu className="gap-2">
              {/* Home Link */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/')}>
                  <Link href="/" className="font-medium">
                    <Home className="size-4 mr-2" />
                    Home
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Create Timeline Link */}
              {user && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive('/timeline/create')}>
                    <Link href="/timeline/create" className="font-medium">
                      <Plus className="size-4 mr-2" />
                      Create Timeline
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {/* Timelines Section */}
              {timelines && timelines.length > 0 && (
                <SidebarMenuItem>
                  <div className="px-2 py-2">
                    <p className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider mb-2">
                      Timelines
                    </p>
                  </div>
                  <SidebarMenuSub className="ml-0 border-l-0 px-1.5">
                    {timelines.map((timeline) => (
                      <SidebarMenuSubItem key={timeline.id}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isActive(`/timeline/${timeline.slug}`)}
                        >
                          <Link href={`/timeline/${timeline.slug}`}>
                            <div className="flex items-center justify-between w-full">
                              <span className="truncate">{timeline.name}</span>
                              <span className="flex items-center gap-1 text-xs text-sidebar-foreground/50 ml-2">
                                <Image className="size-3" />
                                {timeline.memory_count}
                              </span>
                            </div>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </SidebarMenuItem>
              )}

              {/* Empty state for timelines */}
              {timelines && timelines.length === 0 && (
                <SidebarMenuItem>
                  <div className="px-2 py-4 text-center">
                    <p className="text-xs text-sidebar-foreground/50 mb-3">
                      No timelines yet
                    </p>
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/timeline/create" className="gap-1">
                        <Plus className="size-3" />
                        Create one
                      </Link>
                    </Button>
                  </div>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      )}
    </Sidebar>
  )
}
