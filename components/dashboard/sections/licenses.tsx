"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Search,
  KeyRound,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getStatusColor } from "@/lib/license-keys";
import type { License, LicenseStatus } from "@/lib/license-keys";
import { MetricCard } from "@/components/dashboard/metric-card";
import { useLicenses } from "@/hooks/use-api";
import { Skeleton } from "@/components/ui/skeleton";

const statusIcons: Record<LicenseStatus, React.ElementType> = {
  active: CheckCircle2,
  expired: Clock,
  revoked: XCircle,
  suspended: AlertTriangle,
};

const PER_PAGE = 20;

export function LicensesSection() {
  const { data: allLicenses, isLoading } = useLicenses();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const licenses = (allLicenses ?? []) as License[];

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [searchQuery, statusFilter]);

  const maskKey = (key: string) => {
    const lastSegment = key.slice(-4);
    return `\u2022\u2022\u2022\u2022-\u2022\u2022\u2022\u2022-\u2022\u2022\u2022\u2022-${lastSegment}`;
  };

  const counts = {
    total: licenses.length,
    active: licenses.filter((l) => l.status === "active").length,
    expired: licenses.filter((l) => l.status === "expired").length,
    revoked: licenses.filter((l) => l.status === "revoked").length,
  };

  const filteredLicenses = licenses.filter((l) => {
    const matchesSearch =
      l.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.product.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Paginate
  const totalPages = Math.max(1, Math.ceil(filteredLicenses.length / PER_PAGE));
  const paginatedLicenses = filteredLicenses.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary border border-border text-sm text-muted-foreground">
        <KeyRound className="w-4 h-4 shrink-0 text-chart-1" />
        <span>Showing license keys for <span className="font-medium text-foreground">licensed products</span> only. Platform and API products are managed via their respective dashboards.</span>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Licenses" value={String(counts.total)} change={`${counts.active} active`} changeType="neutral" icon={KeyRound} delay={0} />
        <MetricCard title="Active Licenses" value={String(counts.active)} change={`${Math.round((counts.active / (counts.total || 1)) * 100)}% of total`} changeType={counts.active > 0 ? "positive" : "neutral"} icon={CheckCircle2} delay={1} />
        <MetricCard title="Expired Licenses" value={String(counts.expired)} change={counts.expired > 0 ? `${counts.expired} pending renewal` : "None pending"} changeType="neutral" icon={Clock} delay={2} />
        <MetricCard title="Revoked Licenses" value={String(counts.revoked)} change={counts.revoked > 0 ? `${counts.revoked} revoked` : "None revoked"} changeType={counts.revoked > 0 ? "negative" : "neutral"} icon={XCircle} delay={3} />
      </div>

      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search keys, customers, products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-72 h-9 pl-9 pr-4 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-accent transition-all duration-200"
            />
          </div>
          <div className="flex items-center gap-2">
            {["all", "active", "expired", "revoked", "suspended"].map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                  statusFilter === filter
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* License table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">License Key</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Created</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Expires</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLicenses.map((license, index) => {
                const StatusIcon = statusIcons[license.status];
                const statusColor = getStatusColor(license.status);

                return (
                  <tr
                    key={license.key}
                    className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors duration-150 animate-in fade-in slide-in-from-left-2"
                    style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}
                  >
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary text-xs font-mono text-muted-foreground">
                        <KeyRound className="w-3 h-3 shrink-0" />
                        <span>{maskKey(license.key)}</span>
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm font-medium text-foreground">{license.customer}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-1 rounded-md bg-secondary text-xs font-medium text-foreground">{license.product}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium", statusColor)}>
                        <StatusIcon className="w-3 h-3" />
                        {license.status.charAt(0).toUpperCase() + license.status.slice(1)}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-muted-foreground">{license.createdAt}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-muted-foreground">{license.expiresAt}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-secondary/30">
          <span className="text-sm text-muted-foreground">
            Showing {filteredLicenses.length > 0 ? (page - 1) * PER_PAGE + 1 : 0}–{Math.min(page * PER_PAGE, filteredLicenses.length)} of {filteredLicenses.length} licenses
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-2 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-200 disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(Math.max(0, page - 3), page + 2)
              .map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200",
                    p === page
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  {p}
                </button>
              ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-2 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-200 disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
