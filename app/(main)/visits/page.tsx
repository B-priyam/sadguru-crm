"use client";

import React, { useState, useMemo } from "react";
import { useCRM } from "@/context/CRMContext";
import { formatCurrency, formatTimeAgo, getInitials } from "@/lib/crm-utils";
import { format, isSameDay, addDays, subDays } from "date-fns";
import { ChevronLeft, ChevronRight, MapPin, Clock, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import ClientSlideOver from "@/components/ClientSlideOver";

const Visits: React.FC = () => {
  const { clients } = useCRM();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const visitingClients = useMemo(() => {
    return clients
      .filter((c) => c.visit && isSameDay(new Date(c.visit), selectedDate))
      .sort(
        (a, b) => new Date(a.visit!).getTime() - new Date(b.visit!).getTime(),
      );
  }, [clients, selectedDate]);

  const allVisitClients = useMemo(() => {
    return clients
      .filter((c) => c.visit)
      .sort(
        (a, b) => new Date(a.visit!).getTime() - new Date(b.visit!).getTime(),
      );
  }, [clients]);

  const upcomingVisits = useMemo(() => {
    const now = new Date();
    return allVisitClients.filter((c) => new Date(c.visit!) >= now);
  }, [allVisitClients]);

  const isToday = isSameDay(selectedDate, new Date());
  const selectedClient = selectedClientId
    ? clients.find((c) => c.id === selectedClientId)
    : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Site Visits</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage and track client property visits.
        </p>
      </div>

      {/* Date navigation */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-card rounded-xl card-shadow p-3 sm:p-4">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => setSelectedDate((d) => subDays(d, 1))}
        >
          <ChevronLeft size={16} />
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="min-w-0 sm:min-w-[200px] text-xs sm:text-sm"
            >
              <MapPin size={14} className="mr-1.5 sm:mr-2 flex-shrink-0" />
              <span className="truncate">
                {isToday
                  ? "Today's Visits"
                  : format(selectedDate, "MMM d, yyyy")}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(d) => d && setSelectedDate(d)}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => setSelectedDate((d) => addDays(d, 1))}
        >
          <ChevronRight size={16} />
        </Button>
        {!isToday && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => setSelectedDate(new Date())}
          >
            Today
          </Button>
        )}
        <span className="ml-auto text-xs sm:text-sm text-muted-foreground">
          {visitingClients.length} visit
          {visitingClients.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Visits for selected date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
        {visitingClients.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <MapPin
              size={32}
              className="mx-auto text-muted-foreground/40 mb-2"
            />
            <p className="text-sm text-muted-foreground">
              No visits scheduled for{" "}
              {isToday ? "today" : format(selectedDate, "MMM d, yyyy")}
            </p>
          </div>
        ) : (
          visitingClients.map((client) => (
            <div
              key={client.id}
              onClick={() => setSelectedClientId(client.id!)}
              className="rounded-xl bg-card card-shadow p-4 cursor-pointer hover:card-shadow-hover hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                  {getInitials(client.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground">
                    {client.name}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {client.interestedProperty}
                  </p>
                </div>
                <span className="text-xs font-mono font-medium text-primary bg-primary/10 px-2 py-1 rounded-lg flex-shrink-0">
                  {format(new Date(client.visit!), "h:mm a")}
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Phone size={10} /> {client.number}
                </span>
                <span className="capitalize">{client.propertyType}</span>
                <span className="ml-auto font-mono tabular-nums">
                  {formatCurrency(client.budget!)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upcoming visits */}
      {upcomingVisits.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">
            Upcoming Visits
          </h2>
          <div className="rounded-xl bg-card card-shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Client
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Property
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                      Time
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                      Budget
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Stage
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingVisits.slice(0, 15).map((client) => (
                    <tr
                      key={client.id}
                      className="border-b border-border/30 hover:bg-secondary/30 transition-colors cursor-pointer"
                      onClick={() => setSelectedClientId(client.id!)}
                    >
                      <td className="py-3 px-4 font-medium text-foreground">
                        {client.name}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">
                        {client.interestedProperty}
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground hidden sm:table-cell">
                        {format(new Date(client.visit!), "MMM d, yyyy")}
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-primary hidden sm:table-cell">
                        {format(new Date(client.visit!), "h:mm a")}
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums text-foreground/80 text-xs hidden md:table-cell">
                        {formatCurrency(client.budget!)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                          {client.stage.replace("_", " ")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {selectedClient && (
        <ClientSlideOver
          client={selectedClient}
          onClose={() => setSelectedClientId(null)}
        />
      )}
    </div>
  );
};

export default Visits;
