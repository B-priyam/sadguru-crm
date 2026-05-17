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
import {
  Search,
  Plus,
  Trash2,
  Pencil,
  Download,
  ChevronsLeftIcon,
  ChevronLeft,
  ChevronRightIcon,
  ChevronsRightIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ClientForm from "@/components/ClientForm";
import ClientSlideOver from "@/components/ClientSlideOver";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { format } from "date-fns";

const Clients: React.FC = () => {
  const {
    deleteClient,
    searchQuery,
    setSearchQuery,
    currentPage,
    pageDataLength,
    setCurrentPage,
    totalPages,
    stageFilter,
    setStageFilter,
    totalFilteredClients,
  } = useCRM();
  const filteredClients = useFilteredClients();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // const [stageFilter, setStageFilter] = useState<PipelineStage | string>("all");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteId, SetdeleteId] = useState("");

  const displayClients = useMemo(() => {
    if (stageFilter === "all") return filteredClients;
    if (stageFilter === "active") {
      return filteredClients.filter(
        (c) => c.stage === "contacted" || c.stage === "deal_closed",
      );
    }
    return filteredClients.filter((c) => c.stage === stageFilter);
  }, [filteredClients, stageFilter]);

  const selectedClient = selectedId
    ? displayClients.find((c) => c.id === selectedId)
    : undefined;

  const exportCSV = () => {
    const headers = [
      "Name",
      "Phone",
      "Budget",
      "Property",
      "Income",
      "Location",
      "Visit",
      "Notes",
      "Stage",
    ];
    const rows = displayClients.map((c) => [
      c.clientName,
      c.number,
      c.budget,
      c.interestedProperty,
      c.propertyType,
      c.income,
      c.location,
      c.visit,
      c.notes,
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

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Clients</h1>
          <p className="text-sm text-muted-foreground">
            {totalFilteredClients} clients
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
                  Visit
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
                    {client.clientName}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">
                    {/* <div className="text-xs">{client.email}</div> */}
                    <div className="text-xs">{client.number}</div>
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums text-foreground/80">
                    {formatCurrency(client.budget!)}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground hidden lg:table-cell text-sm">
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
                  <td className="py-3 px-4 text-muted-foreground text-xs hidden xl:table-cell">
                    {client.visit
                      ? format(new Date(client.visit!), "do MMM yyyy")
                      : ""}
                  </td>
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
                        onClick={() => {
                          setOpenDeleteDialog(true);
                          SetdeleteId(client.id!);
                        }}
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
          <Pagination className="mt-1">
            <PaginationContent>
              <Button
                onClick={() => setCurrentPage(1)}
                variant={"outline"}
                disabled={currentPage === 1}
              >
                <ChevronsLeftIcon className={`size-5`} />
              </Button>
              <Button
                disabled={currentPage === 1}
                onClick={handlePrevPage}
                variant={"outline"}
              >
                <ChevronLeft className={`size-5`} />
              </Button>
              <PaginationItem>
                <PaginationLink isActive>{currentPage}</PaginationLink>
              </PaginationItem>
              <Button
                variant={"outline"}
                disabled={currentPage === totalPages}
                onClick={handleNextPage}
              >
                <ChevronRightIcon className={`size-5`} />
              </Button>
              <Button
                variant={"outline"}
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
              >
                <ChevronsRightIcon className={`size-5`} />
              </Button>
            </PaginationContent>
          </Pagination>
        </div>
        <p className="text-xs text-gray-500 p-2">{`showing page ${currentPage} of ${totalPages}`}</p>
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

      <AlertDialog
        open={openDeleteDialog}
        onOpenChange={() => setOpenDeleteDialog(!openDeleteDialog)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              client data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                deleteClient(deleteId);
                setOpenDeleteDialog(false);
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Clients;
