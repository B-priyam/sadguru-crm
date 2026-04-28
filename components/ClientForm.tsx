import React, { useState, useMemo } from "react";
import { useCRM } from "@/context/CRMContext";
import {
  PropertyType,
  LeadSource,
  PipelineStage,
  PIPELINE_STAGES,
} from "@/types/crm";
import { formatCurrency } from "@/lib/crm-utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X, CalendarIcon, Plus } from "lucide-react";
import { motion } from "framer-motion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Props {
  clientId?: string | null;
  onClose: () => void;
}

// const propertyTypes: { value: PropertyType; label: string }[] = [
//   { value: "1bhk", label: "1 BHK" },
//   { value: "2bhk", label: "2 BHK" },
//   { value: "3bhk", label: "3 BHK" },
//   { value: "4bhk", label: "4 BHK" },
//   { value: "villa", label: "Villa" },
//   { value: "plot", label: "Plot" },
//   { value: "commercial", label: "Commercial" },
// ];

// const leadSources: { value: LeadSource; label: string }[] = [
//   { value: "referral", label: "Referral" },
//   { value: "website", label: "Website" },
//   { value: "social_media", label: "Social Media" },
//   { value: "walk_in", label: "Walk-in" },
//   { value: "portal", label: "Portal" },
//   { value: "other", label: "Other" },
// ];

const ClientForm: React.FC<Props> = ({ clientId, onClose }) => {
  const { clients, addClient, updateClient, properties, addProperty } =
    useCRM();
  const existing = clientId ? clients.find((c) => c.id === clientId) : null;

  const [name, setName] = useState(existing?.name || "");
  const [number, setNumber] = useState(existing?.number || "");
  const [budget, setBudget] = useState(existing?.budget || "");
  const [location, setLocation] = useState(existing?.location || "");
  const [income, setIncome] = useState(existing?.income || "");
  const [occupation, setOccupation] = useState(existing?.occupation || "Job");
  const [residence, setResidence] = useState(existing?.residence || "Owner");
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(() => {
    if (existing?.interestedProperty) {
      const found = properties.find(
        (p) => p.name === existing.interestedProperty,
      );
      return found?.id || "";
    }
    return "";
  });
  const [selectedUnitType, setSelectedUnitType] = useState<string>(
    existing?.propertyType || "",
  );
  const [propertyType, setPropertyType] = useState<string>(
    existing?.propertyType || "",
  );
  const [propertyArea, setPropertyArea] = useState<string>(
    existing?.propertyArea || "",
  );

  // const [leadSource, setLeadSource] = useState<LeadSource>(
  //   existing?.leadSource || "website",
  // );
  const [stage, setStage] = useState<PipelineStage>(
    existing?.stage || "new_lead",
  );
  const [visit, setVisit] = useState<Date | undefined>(
    existing?.visit ? new Date(existing.visit) : undefined,
  );
  const [visitTime, setVisitTime] = useState(
    existing?.visit ? format(new Date(existing.visit), "HH:mm") : "10:00",
  );
  const [note, setNote] = useState(
    existing?.notes?.length! > 0 ? existing?.notes[0].text : "",
  );
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [newPropertyName, setNewPropertyName] = useState("");

  const selectedProperty = useMemo(() => {
    return properties.find((p) => p.id === selectedPropertyId);
  }, [properties, selectedPropertyId]);

  // const selectedUnit = useMemo(() => {
  //   if (!selectedProperty || !selectedUnitType) return null;
  //   return selectedProperty.units.find((u) => u.type === selectedUnitType);
  // }, [selectedProperty, selectedUnitType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let visitDateISO: string | undefined;
    if (visit) {
      const [h, m] = visitTime.split(":").map(Number);
      const d = new Date(visit);
      d.setHours(h, m, 0, 0);
      visitDateISO = d.toISOString();
    }

    const propertyName = selectedProperty?.name || "";

    if (existing) {
      updateClient(existing.id!, {
        name,
        number,
        budget: budget,
        interestedProperty: propertyName,
        // selectedUnit: selectedUnitType,
        propertyType,
        // leadSource,
        stage,
        visit: visitDateISO,
        // notes: [...existing.notes,note],
        income,
        residence,
        propertyArea,
      });
    } else {
      addClient({
        name,
        number,
        // email,
        budget,
        interestedProperty: propertyName,
        // selectedUnit: selectedUnitType,
        propertyType,
        // leadSource,
        stage,
        visit: visitDateISO,
        income,
        location,
        occupation,
        residence,
        propertyArea,
        notes: note ? [{ text: note, createdAt: new Date(Date.now()) }] : [],
        followUp: [],
      });
    }
    onClose();
  };

  const handleAddProperty = () => {
    if (!newPropertyName.trim()) return;
    addProperty({
      name: newPropertyName.trim(),
      location: "",
      units: [],
    });
    // Select the newly added property
    setTimeout(() => {
      const newProp = properties.find((p) => p.name === newPropertyName.trim());
      if (newProp) setSelectedPropertyId(newProp.id!);
    }, 50);
    setNewPropertyName("");
    setShowAddProperty(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-foreground/20" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
        className="relative w-full max-w-lg bg-card rounded-xl card-shadow p-4 sm:p-6 mx-3 sm:mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground">
            {existing ? "Edit Client" : "Add New Client"}
          </h2>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Name *
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9 text-sm mt-1"
                required
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Phone *
              </label>
              <Input
                value={number}
                onChange={(e) => {
                  const value = e.target.value.replace(/,/g, "");
                  if (!/^[\d\s+]*$/.test(value)) return;
                  if (value.length > 18) return;

                  setNumber(value);
                }}
                className="h-9 text-sm mt-1"
                placeholder="1234567890"
                required
                min={10}
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Income
              </label>
              <Input
                type="text"
                value={income}
                onChange={(e) => {
                  const formatted = Number(
                    e.target.value.replaceAll(",", ""),
                  ).toLocaleString("en-IN");
                  if (e.target.value === "") {
                    setIncome("");
                  } else {
                    setIncome(formatted.toString());
                  }
                }}
                className="h-9 text-sm mt-1"
                placeholder="50,000"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Location
              </label>
              <Input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-9 text-sm mt-1"
                placeholder="Bolivali"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Occupation
              </label>
              <Select
                value={occupation}
                onValueChange={(v) => {
                  setOccupation(v);
                }}
              >
                <SelectTrigger className="min-h-9 mt-1 text-sm flex-1 min-w-full">
                  <SelectValue placeholder="select residence" />
                </SelectTrigger>
                <SelectContent className="">
                  {["Job", "Business", "Other"].map((p) => (
                    <SelectItem key={p} value={p} className="text-xs">
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Residential Type
              </label>
              <Select
                value={residence}
                onValueChange={(v) => {
                  setResidence(v);
                }}
              >
                <SelectTrigger className="min-h-9 mt-1 text-sm flex-1 min-w-full">
                  <SelectValue placeholder="select residence" />
                </SelectTrigger>
                <SelectContent className="">
                  {["Owner", "Rental"].map((p) => (
                    <SelectItem key={p} value={p} className="text-xs">
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Budget (₹)
              </label>
              <Input
                type="text"
                value={budget}
                onChange={(e) => {
                  const formatted = Number(
                    e.target.value.replaceAll(",", ""),
                  ).toLocaleString("en-IN");
                  if (e.target.value === "") {
                    setBudget("");
                  } else {
                    setBudget(formatted.toString());
                  }
                }}
                className="h-9 text-sm mt-1"
                placeholder="50,00,000"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Stage
              </label>
              <Select
                value={stage}
                onValueChange={(v) => setStage(v as PipelineStage)}
              >
                <SelectTrigger className="min-h-9 text-sm mt-1 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PIPELINE_STAGES.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Property & Unit Selection */}
          <div className="space-y-2">
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Interested Property
              </label>
              <div className="flex gap-2 mt-1">
                <Select
                  value={selectedPropertyId}
                  onValueChange={(v) => {
                    setSelectedPropertyId(v);
                    setSelectedUnitType("");
                  }}
                >
                  <SelectTrigger className="h-9 text-sm flex-1">
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((p) => (
                      <SelectItem key={p.id} value={p.id!} className="text-xs">
                        {p.name}{" "}
                        {p.location && (
                          <span className="text-muted-foreground">
                            · {p.location}
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 flex-shrink-0"
                  onClick={() => setShowAddProperty(!showAddProperty)}
                >
                  <Plus size={14} />
                </Button>
              </div>
              {showAddProperty && (
                <div className="mt-2 p-3 rounded-lg bg-secondary/50 flex gap-2">
                  <Input
                    value={newPropertyName}
                    onChange={(e) => setNewPropertyName(e.target.value)}
                    placeholder="Property name"
                    className="h-8 text-xs flex-1"
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={handleAddProperty}
                  >
                    Add
                  </Button>
                </div>
              )}
            </div>

            {/* Unit selection - only show if property is selected and has units */}
            {selectedProperty && selectedProperty.units.length > 0 && (
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Select Unit
                </label>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {selectedProperty.units.map((unit) => (
                    <button
                      key={unit.price}
                      type="button"
                      onClick={() => {
                        setPropertyType(unit.type);
                        setPropertyArea(unit.area);
                      }}
                      className={`text-xs font-medium px-3 py-2 rounded-lg transition-all border flex flex-col items-center gap-0.5 min-w-[80px] ${
                        propertyArea === unit.area
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-secondary text-muted-foreground border-border hover:bg-secondary/80"
                      }`}
                    >
                      <span className="font-semibold">
                        {unit.type.toUpperCase()}
                      </span>
                      <span
                        className={`text-[10px] font-mono ${propertyArea === unit.area ? "text-primary-foreground/80" : "text-muted-foreground"}`}
                      >
                        {unit.area}
                      </span>
                      <span
                        className={`text-[10px] font-mono ${propertyType === unit.type ? "text-primary-foreground/80" : "text-muted-foreground"}`}
                      >
                        {formatCurrency(unit.price.toString())}
                      </span>
                    </button>
                  ))}
                </div>
                {/* {selectedUnit && (
                  <p className="text-[11px] text-primary mt-1.5">
                    Selected: {selectedUnit.type.toUpperCase()} —{" "}
                    {formatCurrency(selectedUnit.price.toString())}
                  </p>
                )} */}
              </div>
            )}

            {selectedProperty && selectedProperty.units.length === 0 && (
              <p className="text-[11px] text-muted-foreground">
                No units configured for this property.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Type
              </label>
              <Select
                value={propertyType}
                onValueChange={(v) => setPropertyType(v as PropertyType)}
              >
                <SelectTrigger className="h-9 text-sm mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div> */}

            {/* <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Source
              </label>
              <Select
                value={leadSource}
                onValueChange={(v) => setLeadSource(v as LeadSource)}
              >
                <SelectTrigger className="h-9 text-sm mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {leadSources.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div> */}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Visit Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-9 text-sm mt-1 justify-start text-left font-normal",
                      !visit && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                    {visit ? format(visit, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={visit}
                    onSelect={setVisit}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Visit Time
              </label>
              <Input
                type="time"
                value={visitTime}
                onChange={(e) => setVisitTime(e.target.value)}
                className="h-9 text-sm mt-1 dark:scheme-dark"
              />
            </div>
          </div>

          {/* {!existing && ( */}
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Initial Notes
            </label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="text-sm mt-1 min-h-[60px]"
              placeholder="Enter some note to remember..."
            />
          </div>
          {/* )} */}

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {existing ? "Update" : "Add Client"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ClientForm;
