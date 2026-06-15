import { useEffect, useMemo, useRef, useState } from 'react'
import AppLogo from '@/components/AppLogo'
import AppMenu from '@/layouts/components/sidenav/components/AppMenu'
import { menuItems, filterMenuByRoles } from '@/layouts/components/data'
import SimplebarClient from '@/components/client-wrappers/SimplebarClient'
import { basePath } from '@/helpers'
import { useAuth } from '@/lib/auth'
import type { MenuItemType } from '@/types/layout.ts'

const Sidenav = () => {
  const inputRef = useRef<HTMLInputElement>(null)
  const roles = useAuth((s) => s.roles)

  const [search, setSearch] = useState('')
  const baseMenu = useMemo(() => filterMenuByRoles(menuItems, roles), [roles])
  const { filtered, openKeys } = useMemo<{ filtered: MenuItemType[]; openKeys: Set<string> }>(() => {
    if (!search.trim()) return { filtered: baseMenu, openKeys: new Set<string>() }
    const keyword = search.toLowerCase()
    return filterMenu(baseMenu, keyword)
  }, [search, baseMenu])

  function filterMenu(
    items: MenuItemType[],
    keyword: string,
  ): {
    filtered: MenuItemType[]
    openKeys: Set<string>
  } {
    const openKeys: Set<string> = new Set()

    const filterItems = (arr: MenuItemType[]): MenuItemType[] =>
      arr
        .map((item) => {
          const labelMatches = item.label.toLowerCase().includes(keyword)
          let children: MenuItemType[] | undefined

          if (item.children) {
            children = filterItems(item.children)
          }
          const hasMatchingChild = children && children.length > 0
          if (labelMatches) {
            openKeys.add(item.key)
            return {
              ...item,
              children: item.children,
            }
          }
          if (hasMatchingChild) {
            openKeys.add(item.key)
            return {
              ...item,
              children,
            }
          }
          return null
        })
        .filter(Boolean) as MenuItemType[]
    return { filtered: filterItems(items), openKeys }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        setSearch('')
      }
    }

    window.addEventListener('keydown', handleKeyDown, { passive: true })
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const hasResults = filtered.length > 0

  return (
    <>
      <aside className="app-sidebar d-flex flex-column">
        <AppLogo />

        <form className="app-menu-filter-container px-4" onSubmit={(e) => e.preventDefault()}>
          <input
            type="text"
            className="form-control"
            id="searchInput"
            placeholder="Filter"
            ref={inputRef}
            autoComplete="off"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <div className="js-filter-message nav-filter-msg badge bg-secondary btn" title="Clear filter" onClick={() => setSearch('')}>
              {filtered.length}
            </div>
          )}
        </form>

        <SimplebarClient id="js-primary-nav" className="mb-auto primary-nav flex-grow-1 h-100">
          {hasResults ? (
            <div id="sidenav" className="scrollbar ">
              <AppMenu menuItems={filtered} openKeys={search ? openKeys : undefined} />
            </div>
          ) : (
            <div className="no-results-msg pt-3 info-container">
              <h6 className="mb-1">No menu items found.</h6>
              <p className="fs-sm">Try searching with different keywords.</p>
              <div className="d-flex align-items-center gap-1 fs-xs fw-500 font-style-italic">
                <kbd className="kbd-key">
                  <svg width="15" height="15" aria-label="Escape key" role="img">
                    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2">
                      <path d="M13.6167 8.936c-.1065.3583-.6883.962-1.4875.962-.7993 0-1.653-.9165-1.653-2.1258v-.5678c0-1.2548.7896-2.1016 1.653-2.1016.8634 0 1.3601.4778 1.4875 1.0724M9 6c-.1352-.4735-.7506-.9219-1.46-.8972-.7092.0246-1.344.57-1.344 1.2166s.4198.8812 1.3445.9805C8.465 7.3992 8.968 7.9337 9 8.5c.032.5663-.454 1.398-1.4595 1.398C6.6593 9.898 6 9 5.963 8.4851m-1.4748.5368c-.2635.5941-.8099.876-1.5443.876s-1.7073-.6248-1.7073-2.204v-.4603c0-1.0416.721-2.131 1.7073-2.131.9864 0 1.6425 1.031 1.5443 2.2492h-2.956"></path>
                    </g>
                  </svg>
                </kbd>{' '}
                to reset
              </div>
            </div>
          )}
        </SimplebarClient>

        <div className="nav-footer">
          <svg className="sa-icon sa-thin">
            <use href={`${basePath}/icons/sprite.svg#wifi`}></use>
          </svg>
        </div>
      </aside>
    </>
  )
}

export default Sidenav
