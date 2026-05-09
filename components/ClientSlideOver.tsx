import React, { useCallback, useState } from "react";
import { useCRM } from "@/context/CRMContext";
import { Client, FollowUp, PIPELINE_STAGES } from "@/types/crm";
import { formatCurrency, formatTimeAgo, getInitials } from "@/lib/crm-utils";
import {
  X,
  MessageSquare,
  Clock,
  Calendar,
  Send,
  CheckCircle2,
  Circle,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

interface Props {
  client: Client;
  onClose: () => void;
}

const ClientSlideOver: React.FC<Props> = ({ client, onClose }) => {
  const { moveClientToStage, updateClient } = useCRM();
  const [noteText, setNoteText] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpNote, setFollowUpNote] = useState("");
  const [tab, setTab] = useState<
    "details" | "notes" | "activity" | "followups"
  >("details");

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    // addNote(client.id!, noteText);
    updateClient(client?.id!, {
      notes: [
        ...client.notes,
        { text: noteText, createdAt: new Date(Date.now()) },
      ],
    });
    setNoteText("");
  };

  const handleDeleteNote = (note: any) => {
    updateClient(client?.id!, {
      notes: client.notes.filter((n) => n.text !== note.text),
    });
  };

  const toggleFollowUp = useCallback((clientId: string, followUp: FollowUp) => {
    // setClients((prev) =>
    //   prev.map((c) => {
    //     if (c.id !== clientId) return c;
    //     return {
    //       ...c,
    //       followUp: c.followUp.map((f) =>
    //         f.id === follow.id ? { ...f, completed: !f.completed } : f,
    //       ),
    //     };
    //   }),
    // );

    updateClient(clientId, {
      followUp: client.followUp.map((f) =>
        f.id === followUp.id ? { ...f, completed: !f.completed } : f,
      ),
    });
  }, []);

  const handleAddFollowUp = () => {
    if (!followUpDate || !followUpNote.trim()) return;

    updateClient(client?.id!, {
      followUp: [
        ...client.followUp,
        {
          id: new Date().toISOString().toString(),
          note: followUpNote,
          date: new Date(Date.now()),
          completed: false,
        },
      ],
    });
    setFollowUpNote("");
    setFollowUpDate("");
    // addFollowUp(client.id!, {
    //   date: new Date(followUpDate).toISOString(),
    //   note: followUpNote,
    //   completed: false,
    // });
    // setFollowUpDate("");
    // setFollowUpNote("");
  };

  const tabs = [
    { id: "details" as const, label: "Details" },
    { id: "notes" as const, label: "Notes" },
    // { id: "activity" as const, label: "Activity" },
    { id: "followups" as const, label: "Follow-ups" },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        <div className="absolute inset-0 bg-foreground/20" onClick={onClose} />
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
          className="relative w-full sm:max-w-[420px] bg-card h-full overflow-y-auto card-shadow"
        >
          <div className="sticky top-0 bg-card z-10 p-4 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {getInitials(client.clientName)}
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-foreground">
                    {client.clientName}
                  </h2>
                  {/* <p className="text-xs text-muted-foreground">
                    {client.email}
                  </p> */}
                </div>
              </div>
              <button
                onClick={onClose}
                className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
              >
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex gap-1 mt-3 overflow-x-auto">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`text-[11px] sm:text-xs font-medium px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex-shrink-0 ${
                    tab === t.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4">
            {tab === "details" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Phone", value: client.number },
                    { label: "Budget", value: formatCurrency(client.budget!) },
                    { label: "Property", value: client.interestedProperty },
                    { label: "Type", value: client.propertyType },
                    {
                      label: "Visit",
                      value: client.visit
                        ? format(new Date(client.visit!), "do MMM yy")
                        : "Not updated",
                    },
                    // {
                    //   label: "Source",
                    //   value: client.leadSource.replace("_", " "),
                    // },
                    // {
                    //   label: "Added",
                    //   value: new Date(client.dateAdded).toLocaleDateString(),
                    // },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        {item.label}
                      </p>
                      <p className="text-sm text-foreground mt-0.5 capitalize">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                    Pipeline Stage
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {PIPELINE_STAGES.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => moveClientToStage(client.id!, s.id)}
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg transition-all ${
                          client.stage === s.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* {client.booking && (
                  <div className="rounded-lg bg-primary/5 p-3 space-y-2">
                    <p className="text-xs font-semibold text-primary">
                      Booking Details
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-[10px] text-muted-foreground">
                          Property
                        </p>
                        <p className="text-xs text-foreground">
                          {client.booking.propertyName}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">
                          Amount
                        </p>
                        <p className="text-xs font-mono tabular-nums text-foreground">
                          {formatCurrency(client.booking.bookingAmount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">
                          Status
                        </p>
                        <p className="text-xs capitalize text-foreground">
                          {client.booking.paymentStatus}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">
                          Commission
                        </p>
                        <p className="text-xs font-mono tabular-nums text-foreground">
                          {formatCurrency(client.booking.commissionEarned)}
                        </p>
                      </div>
                    </div>
                  </div>
                )} */}
              </div>
            )}

            {tab === "notes" && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Add a note..."
                    className="text-sm min-h-[60px]"
                  />
                </div>
                <Button
                  onClick={handleAddNote}
                  size="sm"
                  className="gap-1.5 w-full"
                >
                  <Send size={12} strokeWidth={1.5} /> Add Note
                </Button>
                <div className="space-y-2 mt-4">
                  {/* {client.notes.map((note) => ( */}
                  <div className="gap-2">
                    {client.notes.map((note) => (
                      <div
                        key={note.createdAt.toString()}
                        className="my-2 bg-secondary/50 rounded-lg p-3 relative"
                      >
                        <p className="text-sm text-foreground">{note.text}</p>
                        <span className="text-xs text-gray-500">
                          {format(new Date(note.createdAt), "do MMM yyyy")}
                        </span>

                        <Button
                          variant={"ghost"}
                          className="absolute right-2 top-2"
                          onClick={() => handleDeleteNote(note)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {/* <p className="text-[10px] text-muted-foreground mt-1 italic">
                        {formatTimeAgo(note.createdAt)}
                      </p> */}
                  </div>
                  {/* ))} */}
                  {client.notes.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No notes yet.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* {tab === "activity" && (
              <div className="space-y-1">
                {client.activities.map((a) => (
                  <div key={a.id} className="flex gap-3 py-2">
                    <div className="flex flex-col items-center">
                      <div
                        className={`h-2 w-2 rounded-full mt-1.5 ${
                          a.type === "stage_change"
                            ? "bg-primary"
                            : a.type === "booking"
                              ? "bg-gold"
                              : a.type === "note_added"
                                ? "bg-muted-foreground"
                                : "bg-secondary"
                        }`}
                      />
                      <div className="w-px flex-1 bg-border/50" />
                    </div>
                    <div className="pb-3">
                      <p className="text-sm text-foreground">{a.description}</p>
                      <p className="text-[10px] text-muted-foreground italic">
                        {formatTimeAgo(a.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )} */}

            {tab === "followups" && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="h-9 text-sm dark:[color-scheme:dark]"
                  />
                  <Input
                    value={followUpNote}
                    onChange={(e) => setFollowUpNote(e.target.value)}
                    placeholder="Follow-up note..."
                    className="h-9 text-sm"
                  />
                  <Button
                    onClick={handleAddFollowUp}
                    size="sm"
                    className="gap-1.5 w-full"
                  >
                    <Calendar size={12} strokeWidth={1.5} /> Schedule
                  </Button>
                </div>
                <div className="space-y-2 mt-4">
                  {client.followUp.length > 0 &&
                    client?.followUp?.map((f) => (
                      <div
                        key={f.date.toString()}
                        onClick={() => toggleFollowUp(client.id!, f)}
                        className={`flex items-start gap-2 p-3 rounded-lg cursor-pointer transition-colors ${
                          f.completed ? "bg-primary/5" : "bg-secondary/50"
                        }`}
                      >
                        {f.completed ? (
                          <CheckCircle2
                            size={16}
                            className="text-primary mt-0.5 flex-shrink-0"
                            strokeWidth={1.5}
                          />
                        ) : (
                          <Circle
                            size={16}
                            className="text-muted-foreground mt-0.5 flex-shrink-0"
                            strokeWidth={1.5}
                          />
                        )}
                        <div>
                          <p className={`text-sm text-foreground`}>{f.note}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            <Clock size={10} className="inline mr-1" />
                            {new Date(f.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  {!client?.followUp.length && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No follow-ups scheduled.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ClientSlideOver;
