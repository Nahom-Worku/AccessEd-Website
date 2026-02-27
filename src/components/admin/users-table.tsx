'use client'

import { useState, useMemo } from 'react'
import { Search, ChevronUp, ChevronDown, ChevronsUpDown, Apple, Mail, Chrome } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { TierSelect } from './tier-select'
import type { UserActivity } from '@/lib/types/admin'

const TIER_BADGE: Record<string, string> = {
  explorer: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  member: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  pro: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
}

const STATUS_BADGE: Record<string, string> = {
  Active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'Tried It': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Inactive: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
}

type SortKey = 'email' | 'tier' | 'status' | 'joined' | 'courses' | 'docs' | 'questions' | 'quizzes' | 'total_activity'
type SortDir = 'asc' | 'desc'

const PAGE_SIZE = 25

const SORT_PRESETS = [
  { label: 'Recently Joined', key: 'joined' as SortKey, dir: 'desc' as SortDir },
  { label: 'Most Questions', key: 'questions' as SortKey, dir: 'desc' as SortDir },
  { label: 'Most Documents', key: 'docs' as SortKey, dir: 'desc' as SortDir },
  { label: 'Most Active', key: 'total_activity' as SortKey, dir: 'desc' as SortDir },
  { label: 'Most Courses', key: 'courses' as SortKey, dir: 'desc' as SortDir },
  { label: 'Most Quizzes', key: 'quizzes' as SortKey, dir: 'desc' as SortDir },
]

function SignupIcon({ type }: { type: string }) {
  const normalized = type?.toLowerCase() || ''
  if (normalized.includes('apple')) return <Apple className="h-3.5 w-3.5" />
  if (normalized.includes('google')) return <Chrome className="h-3.5 w-3.5" />
  return <Mail className="h-3.5 w-3.5" />
}

function signupLabel(type: string) {
  const normalized = type?.toLowerCase() || ''
  if (normalized.includes('apple')) return 'Apple'
  if (normalized.includes('google')) return 'Google'
  return 'Email'
}

interface UsersTableProps {
  users: UserActivity[]
}

export function UsersTable({ users }: UsersTableProps) {
  const [search, setSearch] = useState('')
  const [tierFilter, setTierFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [signupFilter, setSignupFilter] = useState<string>('all')
  const [sortKey, setSortKey] = useState<SortKey>('joined')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(0)

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
    setPage(0)
  }

  const applyPreset = (key: SortKey, dir: SortDir) => {
    setSortKey(key)
    setSortDir(dir)
    setPage(0)
  }

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronsUpDown className="h-3 w-3 opacity-40" />
    return sortDir === 'asc' ? (
      <ChevronUp className="h-3 w-3" />
    ) : (
      <ChevronDown className="h-3 w-3" />
    )
  }

  const filtered = useMemo(() => {
    let result = users

    if (search) {
      const q = search.toLowerCase()
      result = result.filter((u) => u.email.toLowerCase().includes(q))
    }

    if (tierFilter !== 'all') {
      result = result.filter((u) => u.tier === tierFilter)
    }

    if (statusFilter !== 'all') {
      result = result.filter((u) => u.status === statusFilter)
    }

    if (signupFilter !== 'all') {
      result = result.filter((u) => signupLabel(u.signup_type) === signupFilter)
    }

    result = [...result].sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'email':
          cmp = a.email.localeCompare(b.email)
          break
        case 'tier':
          cmp = a.tier.localeCompare(b.tier)
          break
        case 'status':
          cmp = a.status.localeCompare(b.status)
          break
        case 'joined':
          cmp = new Date(a.joined).getTime() - new Date(b.joined).getTime()
          break
        case 'courses':
          cmp = a.courses - b.courses
          break
        case 'docs':
          cmp = a.docs - b.docs
          break
        case 'questions':
          cmp = a.questions - b.questions
          break
        case 'quizzes':
          cmp = a.quizzes - b.quizzes
          break
        case 'total_activity':
          cmp = a.total_activity - b.total_activity
          break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    return result
  }, [users, search, tierFilter, statusFilter, signupFilter, sortKey, sortDir])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const pageData = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0) }}
            className="w-full h-10 rounded-lg border border-border bg-card pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={tierFilter}
          onChange={(e) => { setTierFilter(e.target.value); setPage(0) }}
          className="h-10 rounded-lg border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All Tiers</option>
          <option value="explorer">Explorer</option>
          <option value="member">Member</option>
          <option value="pro">Pro</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0) }}
          className="h-10 rounded-lg border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All Status</option>
          <option value="Active">Active</option>
          <option value="Tried It">Tried It</option>
          <option value="Inactive">Inactive</option>
        </select>
        <select
          value={signupFilter}
          onChange={(e) => { setSignupFilter(e.target.value); setPage(0) }}
          className="h-10 rounded-lg border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All Signup Methods</option>
          <option value="Email">Email</option>
          <option value="Google">Google</option>
          <option value="Apple">Apple</option>
        </select>
      </div>

      {/* Sort Presets */}
      <div className="flex flex-wrap gap-2">
        {SORT_PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => applyPreset(preset.key, preset.dir)}
            className={cn(
              'h-8 px-3 rounded-full text-xs font-medium border transition-colors',
              sortKey === preset.key && sortDir === preset.dir
                ? 'border-foreground/30 bg-secondary text-foreground'
                : 'border-border text-muted-foreground hover:bg-secondary/50 hover:text-foreground',
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">{filtered.length} users</p>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-4 py-3 font-medium">
                  <button onClick={() => toggleSort('email')} className="flex items-center gap-1">
                    Email <SortIcon col="email" />
                  </button>
                </th>
                <th className="text-left px-4 py-3 font-medium">Signup</th>
                <th className="text-left px-4 py-3 font-medium">
                  <button onClick={() => toggleSort('tier')} className="flex items-center gap-1">
                    Tier <SortIcon col="tier" />
                  </button>
                </th>
                <th className="text-left px-4 py-3 font-medium">
                  <button onClick={() => toggleSort('status')} className="flex items-center gap-1">
                    Status <SortIcon col="status" />
                  </button>
                </th>
                <th className="text-left px-4 py-3 font-medium">
                  <button onClick={() => toggleSort('joined')} className="flex items-center gap-1">
                    Joined <SortIcon col="joined" />
                  </button>
                </th>
                <th className="text-center px-4 py-3 font-medium">
                  <button onClick={() => toggleSort('courses')} className="flex items-center gap-1 mx-auto">
                    Courses <SortIcon col="courses" />
                  </button>
                </th>
                <th className="text-center px-4 py-3 font-medium">
                  <button onClick={() => toggleSort('docs')} className="flex items-center gap-1 mx-auto">
                    Docs <SortIcon col="docs" />
                  </button>
                </th>
                <th className="text-center px-4 py-3 font-medium">
                  <button onClick={() => toggleSort('questions')} className="flex items-center gap-1 mx-auto">
                    Qs <SortIcon col="questions" />
                  </button>
                </th>
                <th className="text-center px-4 py-3 font-medium">
                  <button onClick={() => toggleSort('quizzes')} className="flex items-center gap-1 mx-auto">
                    Quizzes <SortIcon col="quizzes" />
                  </button>
                </th>
                <th className="text-center px-4 py-3 font-medium">
                  <button onClick={() => toggleSort('total_activity')} className="flex items-center gap-1 mx-auto">
                    Activity <SortIcon col="total_activity" />
                  </button>
                </th>
                <th className="text-center px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageData.map((user) => (
                <tr key={user.email} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3 font-medium truncate max-w-[220px]">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <SignupIcon type={user.signup_type} />
                      <span className="text-xs">{signupLabel(user.signup_type)}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('inline-block px-2 py-0.5 rounded-full text-xs font-medium', TIER_BADGE[user.tier] || TIER_BADGE.explorer)}>
                      {user.tier}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('inline-block px-2 py-0.5 rounded-full text-xs font-medium', STATUS_BADGE[user.status] || STATUS_BADGE.Inactive)}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {new Date(user.joined).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-center">{user.courses}</td>
                  <td className="px-4 py-3 text-center">{user.docs}</td>
                  <td className="px-4 py-3 text-center">{user.questions}</td>
                  <td className="px-4 py-3 text-center">{user.quizzes}</td>
                  <td className="px-4 py-3 text-center">{user.total_activity}</td>
                  <td className="px-4 py-3 text-center">
                    <TierSelect email={user.email} currentTier={user.tier} />
                  </td>
                </tr>
              ))}
              {pageData.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-muted-foreground">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="h-9 px-3 rounded-lg border border-border text-sm font-medium hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="h-9 px-3 rounded-lg border border-border text-sm font-medium hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
