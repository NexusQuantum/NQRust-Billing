"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Search, MoreHorizontal, Trash2, Copy, Check, KeyRound, ShieldOff, CalendarPlus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { getStatusColor } from "@/lib/license-keys";
import { useLicenses, updateLicense, deleteLicense } from "@/hooks/use-api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteDialog } from "./delete-dialog";

type License = Record<string, unknown>;

/* ---------- detail view ---------- */

function LicenseDetail({ license, onDelete, onCopyKey, onRevoke, onExtend, copiedKey }: {
  license: License;
  onDelete: () => void;
  onCopyKey: (key: string) => void;
  onRevoke: (key: string) => void;
  onExtend: (key: string, expiresAt: string) => void;
  copiedKey: string | null;
}) {
  const key = license.key as string;
  const status = license.status as string;
  const statusCls = getStatusColor(status as "active" | "expired" | "revoked" | "suspended");

  const labelClass = "text-xs text-muted-foreground uppercase tracking-wider";
  const valueClass = "text-sm font-medium text-foreground mt-0.5";

  return (
    <div>
      <DialogHeader>
        <DialogTitle className="text-lg">License Details</DialogTitle>
        <DialogDescription>View license information and manage actions</DialogDescription>
      </DialogHeader>

      <div className="mt-6 space-y-6">
        {/* License key */}
        <div>
          <p className={labelClass}>License Key</p>
          <div className="mt-1.5">
            <button onClick={() => onCopyKey(key)} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-sm font-mono text-foreground transition-colors">
              <KeyRound className="w-4 h-4 text-chart-1 shrink-0" />
              <span>{key}</span>
              {copiedKey === key ? <Check className="w-4 h-4 text-success shrink-0" /> : <Copy className="w-4 h-4 text-muted-foreground shrink-0" />}
            </button>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className={labelClass}>Customer</p>
            <p className={valueClass}>{license.customer as string}</p>
          </div>
          <div>
            <p className={labelClass}>Product</p>
            <p className={valueClass}>{license.product as string}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className={labelClass}>Status</p>
            <span className={cn("inline-flex px-2 py-0.5 rounded-md text-xs font-medium capitalize mt-0.5", statusCls)}>{status}</span>
          </div>
          <div>
            <p className={labelClass}>Created</p>
            <p className={valueClass}>{license.createdAt as string}</p>
          </div>
          <div>
            <p className={labelClass}>Expires</p>
            <p className={valueClass}>{license.expiresAt as string}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-6 mt-6 border-t border-border">
        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={onDelete}>
          <Trash2 className="w-4 h-4 mr-1.5" />
          Delete
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onCopyKey(key)}>
            {copiedKey === key ? <Check className="w-4 h-4 mr-1.5 text-success" /> : <Copy className="w-4 h-4 mr-1.5" />}
            {copiedKey === key ? "Copied" : "Copy Key"}
          </Button>
          {status === "active" && (
            <Button variant="outline" size="sm" onClick={() => onRevoke(key)}>
              <ShieldOff className="w-4 h-4 mr-1.5" />
              Revoke
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => onExtend(key, license.expiresAt as string)}>
            <CalendarPlus className="w-4 h-4 mr-1.5" />
            Extend 1 Year
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ---------- main ---------- */

export function ManageLicensesSection() {
  const { data: allLicenses, isLoading, mutate } = useLicenses();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<License | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const licenses = (allLicenses ?? []) as License[];
  const filtered = licenses.filter((l) => {
    const key = (l.key as string).toLowerCase();
    const customer = (l.customer as string).toLowerCase();
    const product = (l.product as string).toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch = key.includes(q) || customer.includes(q) || product.includes(q);
    const matchesStatus = statusFilter === "all" || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openDetail = (license: License) => {
    setSelectedLicense(license);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedLicense(null);
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRevoke = async (key: string) => {
    try {
      await updateLicense(key, { status: "revoked" });
      mutate();
      toast.success("License revoked");
      closeDialog();
    } catch {
      toast.error("Failed to revoke license");
    }
  };

  const handleExtend = async (key: string, currentExpiry: string) => {
    try {
      const d = new Date(currentExpiry);
      d.setFullYear(d.getFullYear() + 1);
      await updateLicense(key, { expiresAt: d.toISOString().split("T")[0] });
      mutate();
      toast.success("License extended by 1 year");
      closeDialog();
    } catch {
      toast.error("Failed to extend license");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteLicense(deleteTarget.key as string);
      mutate();
      toast.success("License deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete license");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[500px] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search licenses..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-72 h-9 pl-9 pr-4 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-accent transition-all" />
          </div>
          <div className="flex items-center gap-2">
            {["all", "active", "expired", "revoked", "suspended"].map((f) => (
              <button key={f} onClick={() => setStatusFilter(f)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all", statusFilter === f ? "bg-foreground/10 text-foreground" : "text-muted-foreground hover:text-foreground")}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary px-3 py-1.5 rounded-lg">
          <KeyRound className="w-3.5 h-3.5" />
          Licenses are auto-created from won deals
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead className="px-4 text-xs font-semibold uppercase tracking-wider">Key</TableHead>
              <TableHead className="px-4 text-xs font-semibold uppercase tracking-wider">Customer</TableHead>
              <TableHead className="px-4 text-xs font-semibold uppercase tracking-wider">Product</TableHead>
              <TableHead className="px-4 text-xs font-semibold uppercase tracking-wider">Status</TableHead>
              <TableHead className="px-4 text-xs font-semibold uppercase tracking-wider">Created</TableHead>
              <TableHead className="px-4 text-xs font-semibold uppercase tracking-wider">Expires</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((license) => {
              const key = license.key as string;
              const status = license.status as string;
              const statusCls = getStatusColor(status as "active" | "expired" | "revoked" | "suspended");

              return (
                <TableRow key={key} className="cursor-pointer" onClick={() => openDetail(license)}>
                  <TableCell className="px-4" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => copyKey(key)} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary hover:bg-secondary/80 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors">
                      <KeyRound className="w-3 h-3 shrink-0" />
                      <span>{key}</span>
                      {copiedKey === key ? <Check className="w-3 h-3 text-success shrink-0" /> : <Copy className="w-3 h-3 shrink-0" />}
                    </button>
                  </TableCell>
                  <TableCell className="px-4 text-sm">{license.customer as string}</TableCell>
                  <TableCell className="px-4 text-sm">{license.product as string}</TableCell>
                  <TableCell className="px-4">
                    <span className={cn("inline-flex px-2 py-0.5 rounded-md text-xs font-medium capitalize", statusCls)}>{status}</span>
                  </TableCell>
                  <TableCell className="px-4 text-sm text-muted-foreground">{license.createdAt as string}</TableCell>
                  <TableCell className="px-4 text-sm text-muted-foreground">{license.expiresAt as string}</TableCell>
                  <TableCell className="px-4" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => copyKey(key)}>
                          <Copy className="w-4 h-4" />Copy Key
                        </DropdownMenuItem>
                        {status === "active" && (
                          <DropdownMenuItem onClick={() => handleRevoke(key)}>
                            <ShieldOff className="w-4 h-4" />Revoke
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleExtend(key, license.expiresAt as string)}>
                          <CalendarPlus className="w-4 h-4" />Extend 1 Year
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(license)}>
                          <Trash2 className="w-4 h-4" />Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-secondary/30">
          <span className="text-sm text-muted-foreground">Showing {filtered.length} of {licenses.length} licenses</span>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedLicense && (
            <LicenseDetail
              license={selectedLicense}
              onDelete={() => { closeDialog(); setDeleteTarget(selectedLicense); }}
              onCopyKey={copyKey}
              onRevoke={handleRevoke}
              onExtend={handleExtend}
              copiedKey={copiedKey}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <DeleteDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }} title="Delete license?" description={`This will permanently delete license key "${deleteTarget?.key ?? ""}".`} onConfirm={handleDelete} loading={deleteLoading} />
    </div>
  );
}
