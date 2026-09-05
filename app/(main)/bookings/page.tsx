"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useCRM } from "@/context/CRMContext";
import { PIPELINE_STAGES, PipelineStage } from "@/types/crm";
import { formatCurrency, getInitials } from "@/lib/crm-utils";
import { Input } from "@/components/ui/input";
import {
  Search,
  BookCheck,
  TrendingUp,
  IndianRupee,
  Filter,
} from "lucide-react";
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
import { isSameMonth } from "date-fns";
import { useSearchParams } from "next/navigation";

const BOOKING_STAGES: PipelineStage[] = ["booking_confirmed", "deal_closed"];

const Bookings: React.FC = () => {
  const { clients, properties } = useCRM();
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [brokerageRate, setBrokerageRate] = useState(3);
  const searchParams = useSearchParams();
  const activeTabs = searchParams.get("activeTabs");

  useEffect(() => {
    if (activeTabs) {
      console.log("activeTabs", activeTabs);
      setStageFilter(activeTabs);
    }
  }, [activeTabs]);

  const bookings = useMemo(
    () => clients.filter((c) => BOOKING_STAGES.includes(c.stage)),
    [clients],
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return bookings.filter((c) => {
      if (stageFilter !== "all" && c.stage !== stageFilter) return false;
      if (!q) return true;
      return (
        c.clientName.toLowerCase().includes(q) ||
        (c.number || "").includes(q) ||
        (c.interestedProperty || "").toLowerCase().includes(q)
      );
    });
  }, [bookings, query, stageFilter]);

  const confirmedCount = bookings.filter(
    (b) => b.stage === "booking_confirmed",
  );

  const closedCount = bookings.filter((b) => b.stage === "deal_closed");
  const totalValue = filtered.reduce(
    (sum, b) => sum + (Number(b.budget?.replaceAll(",", "")) || 0),
    0,
  );
  const totalMothlyValue = filtered
    .filter(
      (d) => d.bookingDate && isSameMonth(new Date(d.bookingDate), new Date()),
    )
    .reduce((sum, b) => sum + (Number(b.budget?.replaceAll(",", "")) || 0), 0);

  const totalBrokerage = filtered.reduce(
    (sum, b) =>
      sum +
      ((Number(b.agreementValue?.replaceAll(",", "")) *
        Number(b?.brokerageRate || 3)) /
        100 || 0),
    0,
  );

  const totalMothlyBrokerage = filtered
    .filter(
      (d) => d.bookingDate && isSameMonth(new Date(d.bookingDate), new Date()),
    )
    .reduce(
      (sum, b) =>
        sum +
        (Number(b.agreementValue?.replaceAll(",", "")) *
          Number(b?.brokerageRate || 3) || 0),
      0,
    );

  const selectedClient = selectedId
    ? clients.find((c) => c.id === selectedId)
    : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Bookings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {bookings.length} booking{bookings.length !== 1 ? "s" : ""} from
          confirmed and closed deals.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
        <KPICard
          label="Booking Confirmed"
          value2={confirmedCount.length}
          icon={<BookCheck size={18} strokeWidth={1.5} />}
          subtitle="Month"
          value={
            confirmedCount?.filter(
              (d) =>
                d.bookingDate &&
                isSameMonth(new Date(d.bookingDate), new Date()),
            ).length
          }
          subtitle2="Total"
        />
        <KPICard
          label="Deals Closed"
          subtitle2="Total"
          value2={closedCount.length}
          icon={<TrendingUp size={18} strokeWidth={1.5} />}
          value={
            closedCount?.filter(
              (d) =>
                d.bookingDate &&
                isSameMonth(new Date(d.bookingDate), new Date()),
            ).length
          }
          subtitle="Month"
        />
        <KPICard
          label="Total Value"
          value2={formatCurrency(String(totalValue))}
          subtitle="Month"
          icon={<IndianRupee size={18} strokeWidth={1.5} />}
          value={formatCurrency(String(totalMothlyValue))}
          subtitle2="Total"
        />
        <KPICard
          label="Total Value"
          subtitle2="Total"
          value2={formatCurrency(String(totalBrokerage))}
          subtitle="Month"
          value={formatCurrency(String(totalMothlyBrokerage))}
          icon={<IndianRupee size={18} strokeWidth={1.5} />}
        />
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
            placeholder="Search bookings..."
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
            {BOOKING_STAGES.map((s) => (
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
            <BookCheck
              size={32}
              className="mx-auto text-muted-foreground/40 mb-2"
            />
            <p className="text-sm text-muted-foreground">No bookings found.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="h-10 text-xs text-center">
                  Client
                </TableHead>
                <TableHead className="h-10 text-xs hidden sm:table-cell">
                  Property
                </TableHead>
                <TableHead className="h-10 text-xs hidden md:table-cell ">
                  Number
                </TableHead>
                <TableHead className="h-10 text-xs text-center">
                  Value
                </TableHead>
                <TableHead className="h-10 text-xs text-center">Rate</TableHead>
                <TableHead className="h-10 text-xs text-center">
                  Brokerage
                </TableHead>
                <TableHead className="h-10 text-xs ">Stage</TableHead>
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
                          <p className="text-[11px] text-muted-foreground sm:hidden truncate">
                            {client.interestedProperty || "—"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-2.5 text-sm text-muted-foreground hidden sm:table-cell truncate max-w-[200px]">
                      {client.interestedProperty || "—"}
                    </TableCell>
                    <TableCell className="py-2.5 text-sm text-muted-foreground hidden md:table-cell">
                      {client.number}
                    </TableCell>
                    <TableCell className="py-2.5 text-sm font-mono tabular-nums text-center">
                      {formatCurrency(client?.agreementValue || "NA")}
                    </TableCell>
                    <TableCell className="py-2.5 text-sm text-muted-foreground text-center">
                      {`${client?.brokerageRate ? client?.brokerageRate : "3"}%`}
                    </TableCell>
                    <TableCell className="py-2.5 text-sm text-muted-foreground text-center">
                      {client?.agreementValue
                        ? formatCurrency(
                            String(
                              (Number(
                                client.agreementValue?.replaceAll(",", ""),
                              ) *
                                Number(client?.brokerageRate)) /
                                100,
                            ),
                          )
                        : "₹" + 0}
                    </TableCell>
                    <TableCell className="py-2.5 hidden md:inline">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded whitespace-nowrap">
                        {stageLabel}
                      </span>
                    </TableCell>
                    <TableCell className="py-2.5 md:hidden">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded whitespace-nowrap">
                        {getInitials(stageLabel!)}
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

export default Bookings;
