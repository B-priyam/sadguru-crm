"use client";

import React, { useState } from "react";
import { useCRM } from "@/context/CRMContext";
import { PIPELINE_STAGES, PipelineStage } from "@/types/crm";
import { formatCurrency, formatTimeAgo, getInitials } from "@/lib/crm-utils";
import ClientSlideOver from "@/components/ClientSlideOver";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Pipeline: React.FC = () => {
  const { clients, moveClientToStage } = useCRM();
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<PipelineStage | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, clientId: string) => {
    e.dataTransfer.setData("text/plain", clientId);
    setDraggedId(clientId);
  };

  const handleDragOver = (e: React.DragEvent, stage: PipelineStage) => {
    e.preventDefault();
    setOverStage(stage);
  };

  const handleDrop = (e: React.DragEvent, stage: PipelineStage) => {
    e.preventDefault();
    const clientId = e.dataTransfer.getData("text/plain");
    if (clientId) moveClientToStage(clientId, stage);
    setDraggedId(null);
    setOverStage(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setOverStage(null);
  };

  const selectedClient = selectedClientId
    ? clients.find((c) => c.id === selectedClientId)
    : undefined;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          Sales Pipeline
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Drag clients between stages to update progress.
        </p>
      </div>

      <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-4 -mx-4 px-4 lg:mx-0 lg:px-0 snap-x snap-mandatory">
        {PIPELINE_STAGES.map((stage) => {
          const stageClients = clients.filter((c) => c.stage === stage.id);
          const isOver = overStage === stage.id;
          return (
            <div
              key={stage.id}
              className={`flex-shrink-0 w-[240px] sm:w-[280px] rounded-xl p-2.5 sm:p-3 transition-colors duration-200 snap-start ${
                isOver ? "bg-secondary/80" : "bg-secondary/40"
              }`}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDrop={(e) => handleDrop(e, stage.id)}
              onDragLeave={() => setOverStage(null)}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  {stage.label}
                </h3>
                <span className="text-[10px] font-bold bg-card text-muted-foreground px-1.5 py-0.5 rounded tabular-nums card-shadow">
                  {stageClients.length}
                </span>
              </div>

              <div className="space-y-2 min-h-[100px]">
                {stageClients.map((client) => (
                  <motion.div
                    key={client.id}
                    layout
                    layoutId={client.id}
                    draggable
                    onDragStart={(e) =>
                      handleDragStart(
                        e as unknown as React.DragEvent,
                        client.id!,
                      )
                    }
                    onDragEnd={handleDragEnd}
                    onClick={() => setSelectedClientId(client.id!)}
                    className={`group relative rounded-xl bg-card p-3 card-shadow transition-all duration-200 ease-snap cursor-grab active:cursor-grabbing hover:card-shadow-hover hover:-translate-y-0.5 ${
                      draggedId === client.id ? "opacity-50" : ""
                    }`}
                  >
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-semibold text-foreground tracking-tight">
                          {client.clientName}
                        </span>
                        {stage.id === "deal_closed" && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-accent-foreground bg-gold-bg px-1.5 py-0.5 rounded">
                            Closed
                          </span>
                        )}
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs text-muted-foreground">
                          Budget:
                        </span>
                        <span className="text-sm font-mono font-medium text-foreground/80 tabular-nums">
                          {formatCurrency(client.budget!)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {client.interestedProperty}
                      </p>
                      <div
                        className="mt-1 pt-1.5 border-t border-border/50"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Select
                          value={client.stage}
                          onValueChange={(v) =>
                            moveClientToStage(client.id!, v as PipelineStage)
                          }
                        >
                          <SelectTrigger className="h-6 text-[10px] border-none bg-secondary/60 px-2 py-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PIPELINE_STAGES.map((s) => (
                              <SelectItem
                                key={s.id}
                                value={s.id}
                                className="text-xs"
                              >
                                {s.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {selectedClient && (
        <ClientSlideOver
          client={selectedClient}
          onClose={() => setSelectedClientId(null)}
        />
      )}
    </div>
  );
};

export default Pipeline;
