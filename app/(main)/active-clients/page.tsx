"use client";

import React, { useMemo, useState } from "react";
import { useCRM } from "@/context/CRMContext";
import { PIPELINE_STAGES, PipelineStage } from "@/types/crm";
import { formatCurrency, getInitials } from "@/lib/crm-utils";
import { Input } from "@/components/ui/input";
import { Search, UserCheck, Filter } from "lucide-react";
import ClientSlideOver from "@/components/ClientSlideOver";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import KPICard from "@/components/KPICard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ACTIVE_STAGES: PipelineStage[] = [
  "new_lead",
  "contacted",
  "site_visit",
  "negotiation",
  "booking_confirmed",
];

const ActiveLeads: React.FC = () => {
  const { clients } = useCRM();
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const activeClients = useMemo(() => {
    return clients.filter((c) => ACTIVE_STAGES.includes(c.stage));
  }, [clients]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return activeClients.filter((c) => {
      if (stageFilter !== "all" && c.stage !== stageFilter) return false;
      if (!q) return true;
      return (
        c.clientName.toLowerCase().includes(q) ||
        (c.number || "").includes(q) ||
        (c.interestedProperty || "").toLowerCase().includes(q) ||
        (c.location || "").toLowerCase().includes(q)
      );
    });
  }, [activeClients, query, stageFilter]);

  const stageCounts = useMemo(() => {
    const map: Record<string, number> = {};
    ACTIVE_STAGES.forEach((s) => {
      map[s] = activeClients.filter((c) => c.stage === s).length;
    });
    return map;
  }, [activeClients]);

  const selectedClient = selectedId
    ? clients.find((c) => c.id === selectedId)
    : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Active Leads</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {activeClients.length} active lead
          {activeClients.length !== 1 ? "s" : ""} across the pipeline.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
        {ACTIVE_STAGES.map((s) => {
          const label = PIPELINE_STAGES.find((p) => p.id === s)?.label || s;
          return (
            <KPICard
              key={s}
              label={label}
              value={stageCounts[s] || 0}
              icon={<UserCheck size={18} strokeWidth={1.5} />}
            />
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search active leads..."
            className="pl-9 h-9 text-sm"
          />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-full sm:w-[180px] h-9 text-sm">
            <Filter size={12} className="mr-1.5" />
            <SelectValue placeholder="All stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {ACTIVE_STAGES.map((s) => (
              <SelectItem key={s} value={s}>
                {PIPELINE_STAGES.find((p) => p.id === s)?.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl bg-card card-shadow overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <UserCheck
              size={32}
              className="mx-auto text-muted-foreground/40 mb-2"
            />
            <p className="text-sm text-muted-foreground">
              No active leads found.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="h-10 text-xs">Client</TableHead>
                <TableHead className="h-10 text-xs hidden md:table-cell">
                  Number
                </TableHead>
                <TableHead className="h-10 text-xs hidden lg:table-cell">
                  Property
                </TableHead>
                <TableHead className="h-10 text-xs hidden lg:table-cell">
                  Location
                </TableHead>
                <TableHead className="h-10 text-xs text-right">
                  Budget
                </TableHead>
                <TableHead className="h-10 text-xs">Stage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((client) => {
                const stageLabel = PIPELINE_STAGES.find(
                  (s) => s.id === client.stage,
                )?.label;
                return (
                  <TableRow
                    key={client.id}
                    onClick={() => setSelectedId(client.id!)}
                    className="cursor-pointer"
                  >
                    <TableCell className="py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                          {getInitials(client.clientName)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {client.clientName}
                          </p>
                          <p className="text-[11px] text-muted-foreground md:hidden truncate">
                            {client.number}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-2.5 text-sm text-muted-foreground hidden md:table-cell">
                      {client.number}
                    </TableCell>
                    <TableCell className="py-2.5 text-sm text-muted-foreground hidden lg:table-cell truncate max-w-[200px]">
                      {client.interestedProperty || "—"}
                    </TableCell>
                    <TableCell className="py-2.5 text-sm text-muted-foreground hidden lg:table-cell">
                      {client.location || "—"}
                    </TableCell>
                    <TableCell className="py-2.5 text-sm font-mono tabular-nums text-right">
                      {formatCurrency(client.budget || "")}
                    </TableCell>
                    <TableCell className="py-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded whitespace-nowrap">
                        {stageLabel}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {selectedClient && (
        <ClientSlideOver
          client={selectedClient}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
};

export default ActiveLeads;
