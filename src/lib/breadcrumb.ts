export const buildBreadcrumbMap = (navConfig: any) => {
  const map: Record<string, string> = {}

  navConfig.navMain.forEach((group: any) => {
    group.items.forEach((item: any) => {
      map[item.url] = item.title
    })
  })

  return map
}