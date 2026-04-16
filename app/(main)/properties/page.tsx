"use client";

import React, { useState } from "react";
import { useCRM } from "@/context/CRMContext";
import { UnitType, UNIT_TYPES, Property, PropertyUnit } from "@/types/crm";
import { formatCurrency } from "@/lib/crm-utils";
import { Plus, Trash2, Edit2, X, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
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

// const statusOptions: { value: Property["status"]; label: string }[] = [
//   { value: "available", label: "Available" },
//   { value: "upcoming", label: "Upcoming" },
//   { value: "sold_out", label: "Sold Out" },
// ];

const Properties: React.FC = () => {
  const { properties, addProperty, updateProperty, deleteProperty } = useCRM();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  // const [status, setStatus] = useState<Property["status"]>("available");
  const [units, setUnits] = useState<
    { type: UnitType; price: string; area: string }[]
  >([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState("");

  const resetForm = () => {
    setName("");
    setLocation("");
    // setStatus("available");
    setUnits([]);
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (p: Property) => {
    setName(p.name);
    setLocation(p.location);
    // setStatus(p.status);
    setUnits(
      p.units.map((u) => ({
        type: u.type as UnitType,
        price: u.price,
        area: u.area,
      })),
    );
    setEditingId(p.id!);
    setShowForm(true);
  };

  const addUnit = () => {
    const usedTypes = units.map((u) => u.type);
    const nextType = UNIT_TYPES.find((t) => !usedTypes.includes(t.value));
    if (nextType) {
      setUnits((prev) => [
        ...prev,
        { type: nextType.value, price: "", area: "" },
      ]);
    }
  };

  const removeUnit = (index: number) => {
    setUnits((prev) => prev.filter((_, i) => i !== index));
  };

  const updateUnit = (
    index: number,
    field: "type" | "price" | "area",
    value: string,
  ) => {
    setUnits((prev) =>
      prev.map((u, i) => (i === index ? { ...u, [field]: value } : u)),
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const propertyUnits: PropertyUnit[] = units
      .filter((u) => u.price)
      .map((u) => ({
        type: u.type,
        price: u.price,
        area: u.area,
      }));

    const data = { name, location, units: propertyUnits };

    if (editingId) {
      updateProperty(editingId, data);
    } else {
      addProperty(data);
    }
    resetForm();
  };

  // const getStatusColor = (s: Property["status"]) => {
  //   switch (s) {
  //     case "available":
  //       return "bg-primary/10 text-primary";
  //     case "upcoming":
  //       return "bg-accent text-accent-foreground";
  //     case "sold_out":
  //       return "bg-destructive/10 text-destructive";
  //   }
  // };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Properties</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your property listings and unit pricing.
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="gap-1.5"
        >
          <Plus size={14} /> Add Property
        </Button>
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl bg-card card-shadow p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-foreground">
                  {editingId ? "Edit Property" : "Add New Property"}
                </h2>
                <button
                  onClick={resetForm}
                  className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
                >
                  <X size={16} strokeWidth={1.5} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Property Name *
                    </label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-9 text-sm mt-1"
                      required
                      placeholder="e.g. Sunrise Heights"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Location
                    </label>
                    <Input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="h-9 text-sm mt-1"
                      placeholder="e.g. Sector 45, Gurgaon"
                    />
                  </div>
                  {/* <div>
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Status
                    </label>
                    <Select
                      value={status}
                      onValueChange={(v) => setStatus(v as Property["status"])}
                    >
                      <SelectTrigger className="h-9 text-sm mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div> */}
                </div>

                {/* Units with individual pricing */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Available Units & Pricing
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={addUnit}
                      // disabled={units.length >= UNIT_TYPES.length}
                    >
                      <Plus size={12} /> Add Unit
                    </Button>
                  </div>

                  {units.length === 0 && (
                    <p className="text-xs text-muted-foreground py-3 text-center bg-secondary/40 rounded-lg">
                      {`No units added yet. Click "Add Unit" to add available unit
                      types with pricing.`}
                    </p>
                  )}

                  <div className="space-y-2">
                    {units.map((unit, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 rounded-lg bg-secondary/40"
                      >
                        <Select
                          value={unit.type}
                          onValueChange={(v) => updateUnit(index, "type", v)}
                        >
                          <SelectTrigger className="h-8 text-xs w-[100px] sm:w-[120px] flex-shrink-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {UNIT_TYPES.map((t) => (
                              <SelectItem
                                key={t.value}
                                value={t.value}
                                // disabled={units.some(
                                //   (u, i) => i !== index && u.type === t.value,
                                // )}
                                className="text-xs"
                              >
                                {t.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="md:flex-1 md:relative ">
                          <Input
                            type="text"
                            value={unit.area}
                            onChange={(e) =>
                              updateUnit(index, "area", e.target.value)
                            }
                            className="h-8 text-xs pl-2 md:pl-6"
                            placeholder="Area"
                          />
                          <span className="hidden md:absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                            {" "}
                            Sq.ft
                          </span>
                        </div>
                        <div className="md:flex-1 md:relative">
                          <span className="hidden md:absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                            ₹
                          </span>
                          <Input
                            type="text"
                            value={unit.price}
                            onChange={(e) => {
                              const formatted = Number(
                                e.target.value.replaceAll(",", ""),
                              ).toLocaleString("en-IN");
                              if (e.target.value === "") {
                                updateUnit(index, "price", "");
                              } else {
                                updateUnit(index, "price", formatted);
                              }
                            }}
                            className="h-8 text-xs pl-1 md:pl-6 "
                            placeholder="Price"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeUnit(index)}
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors flex-shrink-0"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingId ? "Update Property" : "Add Property"}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {properties.map((p) => (
          <motion.div
            key={p.id}
            layout
            className="rounded-xl bg-card card-shadow p-4 hover:card-shadow-hover transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Building2
                    size={16}
                    className="text-primary"
                    strokeWidth={1.5}
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-foreground truncate">
                    {p.name}
                  </h3>
                  {p.location && (
                    <p className="text-[11px] text-muted-foreground truncate">
                      {p.location}
                    </p>
                  )}
                </div>
              </div>
              {/* <span
                className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded flex-shrink-0 ${getStatusColor(p.status)}`}
              >
                {p.status.replace("_", " ")}
              </span> */}
            </div>

            {p.units.length > 0 && (
              <div className="space-y-1.5 mb-3">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Units & Pricing
                </span>
                <div className="space-y-1">
                  {p.units.map((u) => (
                    <div
                      key={u.price}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-secondary/50"
                    >
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0"
                      >
                        {u.type.toUpperCase()}
                      </Badge>
                      <span className="text-xs font-mono font-medium text-foreground tabular-nums">
                        {u.area ? `${u.area} Sq.ft` : ""}
                      </span>
                      <span className="text-xs font-mono font-medium text-foreground tabular-nums">
                        {formatCurrency(u.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {p.units.length === 0 && (
              <p className="text-xs text-muted-foreground mb-3">
                No units configured
              </p>
            )}

            <div className="pt-3 border-t border-border/50 flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 h-7 text-xs gap-1"
                onClick={() => handleEdit(p)}
              >
                <Edit2 size={12} /> Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 h-7 text-xs gap-1 text-destructive hover:text-destructive"
                onClick={() => {
                  setOpenDeleteDialog(true);
                  setDeleteId(p.id!);
                }}
              >
                <Trash2 size={12} /> Delete
              </Button>
            </div>
          </motion.div>
        ))}
        {properties.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Building2
              size={32}
              className="mx-auto text-muted-foreground/40 mb-2"
            />
            <p className="text-sm text-muted-foreground">
              No properties added yet.
            </p>
          </div>
        )}
      </div>
      <AlertDialog
        open={openDeleteDialog}
        onOpenChange={() => setOpenDeleteDialog(!openDeleteDialog)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              property data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                deleteProperty(deleteId);
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

export default Properties;
