"use client";

import React, { useState, useMemo } from "react";
import { useCRM } from "@/context/CRMContext";
import {
  useFilteredClients,
  formatCurrency,
  formatTimeAgo,
} from "@/lib/crm-utils";
import {
  PIPELINE_STAGES,
  PropertyType,
  LeadSource,
  PipelineStage,
} from "@/types/crm";
import { Search, Plus, Trash2, Pencil, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ClientForm from "@/components/ClientForm";
import ClientSlideOver from "@/components/ClientSlideOver";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Clients: React.FC = () => {
  const { deleteClient, searchQuery, setSearchQuery } = useCRM();
  const filteredClients = useFilteredClients();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stageFilter, setStageFilter] = useState<string>("all");

  const displayClients = useMemo(() => {
    if (stageFilter === "all") return filteredClients;
    return filteredClients.filter((c) => c.stage === stageFilter);
  }, [filteredClients, stageFilter]);

  const selectedClient = selectedId
    ? displayClients.find((c) => c.id === selectedId)
    : undefined;

  const exportCSV = () => {
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Budget",
      "Property",
      "Type",
      "Source",
      "Stage",
      "Date Added",
    ];
    const rows = displayClients.map((c) => [
      c.name,
      c.number,
      c.budget,
      c.interestedProperty,
      c.propertyType,
      c.income,
      c.location,
      c.visit,
      c.followUp,
      c.note,
      c.stage,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "clients.csv";
    a.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Clients</h1>
          <p className="text-sm text-muted-foreground">
            {displayClients.length} clients
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={exportCSV}
            variant="outline"
            size="sm"
            className="gap-1.5"
          >
            <Download size={14} strokeWidth={1.5} /> Export
          </Button>
          <Button
            onClick={() => {
              setEditingId(null);
              setShowForm(true);
            }}
            size="sm"
            className="gap-1.5"
          >
            <Plus size={14} strokeWidth={1.5} /> Add Client
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clients..."
            className="pl-9 h-9 text-sm"
          />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-full sm:w-[180px] h-9 text-sm">
            <SelectValue placeholder="All Stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {PIPELINE_STAGES.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl bg-card card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Name
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                  Contact
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Budget
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                  Property
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                  Stage
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden xl:table-cell">
                  Last Contact
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {displayClients.map((client) => (
                <tr
                  key={client.id}
                  className="border-b border-border/30 hover:bg-secondary/30 transition-colors cursor-pointer"
                  onClick={() => setSelectedId(client.id!)}
                >
                  <td className="py-3 px-4 font-medium text-foreground">
                    {client.name}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">
                    {/* <div className="text-xs">{client.email}</div> */}
                    <div className="text-xs">{client.number}</div>
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums text-foreground/80">
                    {formatCurrency(client.budget!)}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground hidden lg:table-cell text-xs">
                    {client.interestedProperty}
                  </td>
                  <td className="py-3 px-4 hidden sm:table-cell">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                      {
                        PIPELINE_STAGES.find((s) => s.id === client.stage)
                          ?.label
                      }
                    </span>
                  </td>
                  {/* <td className="py-3 px-4 text-muted-foreground text-xs hidden xl:table-cell italic">
                    {formatTimeAgo(client.lastContact)}
                  </td> */}
                  <td className="py-3 px-4 text-right">
                    <div
                      className="flex justify-end gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          setEditingId(client.id!);
                          setShowForm(true);
                        }}
                        className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors"
                      >
                        <Pencil size={13} strokeWidth={1.5} />
                      </button>
                      <button
                        onClick={() => deleteClient(client.id!)}
                        className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      >
                        <Trash2 size={13} strokeWidth={1.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <ClientForm
          clientId={editingId}
          onClose={() => {
            setShowForm(false);
            setEditingId(null);
          }}
        />
      )}

      {selectedClient && (
        <ClientSlideOver
          client={selectedClient}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
};

export default Clients;
