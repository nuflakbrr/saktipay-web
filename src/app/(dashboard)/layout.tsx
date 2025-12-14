'use client'

import { Fragment, ReactNode, useMemo } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"

import { useAuth } from "@/hooks/useAuth"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/ui/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ThemeToggle } from "@/components/Common/ThemeToggle"
import { navLinkAdmin, navLinkCashier } from "@/constant/navlink"
import { buildBreadcrumbMap } from "@/lib/breadcrumb"

type Props = {
  children: ReactNode
}

export default function Layout({ children }: Props) {
  const pathname = usePathname()
  const { user } = useAuth()

  const navConfig =
    user?.role === "admin"
      ? navLinkAdmin
      : navLinkCashier

  const breadcrumbMap = useMemo(
    () => buildBreadcrumbMap(navConfig),
    [navConfig]
  )

  const segments = pathname
    .split("/")
    .filter(Boolean)
    .filter(seg => seg !== "dashboard")

  const formatSegment = (segment: string) =>
    segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, c => c.toUpperCase())

  const getLabel = (href: string, segment: string) =>
    breadcrumbMap[href] ?? formatSegment(segment)

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "19rem" } as React.CSSProperties}
    >
      <AppSidebar />
      <SidebarInset>
        <header className="flex items-center justify-between px-4 print:hidden">
          <div className="flex h-16 items-center gap-2 pr-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-4" />

            {/* ✅ BREADCRUMB BENAR */}
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>

                {segments.map((segment, index) => {
                  const href = "/" + segments.slice(0, index + 1).join("/")
                  const isLast = index === segments.length - 1
                  const isVirtualParent = href === "/master" || href === "/sales"

                  return (
                    <Fragment key={href}>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        {isLast || isVirtualParent ? (
                          <BreadcrumbPage>
                            {getLabel(href, segment)}
                          </BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link href={href}>
                              {getLabel(href, segment)}
                            </Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </Fragment>
                  )
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <ThemeToggle />
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 my-5">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
