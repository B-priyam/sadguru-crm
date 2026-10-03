"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  LocateFixed,
  Loader2,
  MapPin,
  Navigation,
  RefreshCw,
  ShieldCheck,
  TimerReset,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
// import { supabase } from "@/integrations/supabase/client";
// import type { Database } from "@/integrations/supabase/types";

// type AttendanceRecord = Database["public"]["Tables"]["attendance"]["Row"];
type Coordinates = Pick<
  GeolocationCoordinates,
  "latitude" | "longitude" | "accuracy"
>;

const getLocalDate = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));

const formatTime = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(value))
    : "—";

const Attendance: React.FC = () => {
  //   const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [locationState, setLocationState] = useState<
    "idle" | "requesting" | "ready" | "denied"
  >("idle");
  const [locationMessage, setLocationMessage] = useState(
    "Location access is requested automatically when this page opens.",
  );
  const [pageError, setPageError] = useState("");
  const [actionError, setActionError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState<
    "check-in" | "check-out" | null
  >(null);

  const today = getLocalDate();
  //   const todayRecord = useMemo(
  //     () => records.find((record) => record.work_date === today),
  //     [records, today],
  //   );
  //   const isCheckedIn = Boolean(todayRecord && !todayRecord.checked_out_at);

  //   const loadRecords = useCallback(async () => {
  //     if (!user) return;

  //     const { data, error } = await supabase
  //       .from("attendance")
  //       .select("*")
  //       .eq("user_id", user.id)
  //       .order("work_date", { ascending: false })
  //       .order("checked_in_at", { ascending: false })
  //       .limit(14);

  //     if (error) {
  //       setPageError(error.message);
  //     } else {
  //       setPageError("");
  //       setRecords(data ?? []);
  //     }
  //     setIsLoading(false);
  //   }, [user]);

  const captureLocation = useCallback(
    (): Promise<Coordinates> =>
      new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          const message =
            "Location services are not available in this browser.";
          setLocationState("denied");
          setLocationMessage(message);
          reject(new Error(message));
          return;
        }

        setLocationState("requesting");
        setLocationMessage("Getting your current location…");
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const nextCoordinates = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
            };
            setCoordinates(nextCoordinates);
            setLocationState("ready");
            setLocationMessage(
              `Location ready · approximately ${Math.round(position.coords.accuracy)}m accuracy`,
            );
            resolve(nextCoordinates);
          },
          (error) => {
            const message =
              error.code === error.PERMISSION_DENIED
                ? "Location permission was denied. Allow location access to submit attendance."
                : "We could not get your location. Try again before submitting attendance.";
            setLocationState("denied");
            setLocationMessage(message);
            reject(new Error(message));
          },
          { enableHighAccuracy: true, maximumAge: 30_000, timeout: 15_000 },
        );
      }),
    [],
  );

  //   useEffect(() => {
  //     void loadRecords();
  //   }, [loadRecords]);

  //   useEffect(() => {
  //     if (!user) return;

  //     const channel = supabase
  //       .channel(`attendance-${user.id}`)
  //       .on(
  //         "postgres_changes",
  //         {
  //           event: "*",
  //           schema: "public",
  //           table: "attendance",
  //           filter: `user_id=eq.${user.id}`,
  //         },
  //         () => {
  //           void loadRecords();
  //         },
  //       )
  //       .subscribe();

  //     return () => {
  //       void supabase.removeChannel(channel);
  //     };
  //   }, [loadRecords, user]);

  let isCheckedIn = false;

  useEffect(() => {
    void captureLocation().catch(() => undefined);
  }, [captureLocation]);

  const handleCheckIn = async () => {
    // if (!user || isCheckedIn) return;
    setActionError("");
    setIsSubmitting("check-in");

    try {
      const currentCoordinates = coordinates ?? (await captureLocation());
      //   const { error } = await supabase.from("attendance").insert({
      //     user_id: user.id,
      //     work_date: today,
      //     checked_in_at: new Date().toISOString(),
      //     latitude: currentCoordinates.latitude,
      //     longitude: currentCoordinates.longitude,
      //     accuracy_meters: currentCoordinates.accuracy,
      //     location_captured_at: new Date().toISOString(),
      //     status: "present",
      //   });

      //   if (error) throw error;
      //   await loadRecords();
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Attendance could not be submitted.",
      );
    } finally {
      setIsSubmitting(null);
    }
  };

  const handleCheckOut = async () => {
    // if (!todayRecord || !isCheckedIn) return;
    setActionError("");
    setIsSubmitting("check-out");

    // const { error } = await supabase
    //   .from("attendance")
    //   .update({ checked_out_at: new Date().toISOString(), status: "completed" })
    //   .eq("id", todayRecord.id)
    //   .eq("user_id", user?.id ?? "");

    // if (error) setActionError(error.message);
    // else await loadRecords();
    setIsSubmitting(null);
  };

  const locationBadge =
    locationState === "ready"
      ? { label: "Location ready", className: "bg-primary/10 text-primary" }
      : locationState === "requesting"
        ? {
            label: "Finding location",
            className: "bg-accent/15 text-accent-foreground",
          }
        : {
            label: "Location needed",
            className: "bg-destructive/10 text-destructive",
          };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-primary">
            <MapPin size={16} strokeWidth={1.8} />
            <span className="text-xs font-semibold uppercase tracking-[0.14em]">
              Daily attendance
            </span>
          </div>
          <h1 className="text-xl font-semibold text-foreground">Attendance</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Submit your workday attendance with your current location.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void captureLocation().catch(() => undefined)}
          disabled={locationState === "requesting"}
          className="gap-1.5 self-start"
        >
          {locationState === "requesting" ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <RefreshCw size={14} />
          )}
          Refresh location
        </Button>
      </div>

      {pageError && (
        <Alert variant="destructive">
          <AlertTitle>Attendance unavailable</AlertTitle>
          <AlertDescription>{pageError}</AlertDescription>
        </Alert>
      )}
      {actionError && (
        <Alert variant="destructive">
          <AlertTitle>Could not save attendance</AlertTitle>
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="space-y-4">
          <div className="rounded-xl bg-card p-5 card-shadow sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Clock3 size={21} strokeWidth={1.7} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Today, {formatDate(today)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {true ? `Checked in at ` : "You have not checked in yet"}
                  </p>
                  {/* {todayRecord?.checked_out_at && ( */}
                  <p className="mt-1 text-xs text-muted-foreground">
                    Checked out at
                  </p>
                  {/* )} */}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => void handleCheckIn()}
                  disabled={
                    false ||
                    isSubmitting !== null ||
                    locationState === "requesting"
                  }
                  className="gap-1.5"
                >
                  {isSubmitting === "check-in" ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={15} />
                  )}
                  {true ? "Checked in" : "Check in"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => void handleCheckOut()}
                  disabled={!isCheckedIn || isSubmitting !== null}
                  className="gap-1.5"
                >
                  {isSubmitting === "check-out" ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <TimerReset size={15} />
                  )}
                  Check out
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-card card-shadow">
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4 sm:px-6">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Attendance history
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Your recent workdays
                </p>
              </div>
              <CalendarDays
                size={17}
                className="text-primary"
                strokeWidth={1.6}
              />
            </div>
            {isLoading ? (
              <div className="flex items-center gap-2 px-5 py-8 text-sm text-muted-foreground sm:px-6">
                <Loader2 size={16} className="animate-spin" /> Loading
                attendance…
              </div>
            ) : [].length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-muted-foreground sm:px-6">
                Your submitted attendance will appear here.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Check in</TableHead>
                    <TableHead>Check out</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Location
                    </TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[]?.map((record: any) => (
                    <TableRow key={record.id}>
                      <TableCell className="py-3 text-sm font-medium">
                        {formatDate(record.work_date)}
                      </TableCell>
                      <TableCell className="py-3 text-sm tabular-nums">
                        {formatTime(record.checked_in_at)}
                      </TableCell>
                      <TableCell className="py-3 text-sm tabular-nums">
                        {formatTime(record.checked_out_at)}
                      </TableCell>
                      <TableCell className="hidden py-3 text-xs text-muted-foreground sm:table-cell">
                        {record.latitude !== null
                          ? `${Math.round(record.accuracy_meters ?? 0)}m accuracy`
                          : "—"}
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge
                          variant={
                            record.checked_out_at ? "secondary" : "default"
                          }
                        >
                          {record.checked_out_at ? "Completed" : "Present"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-xl bg-card p-5 card-shadow">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Location status
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Required for check-in
                </p>
              </div>
              <LocateFixed
                size={18}
                className="text-primary"
                strokeWidth={1.6}
              />
            </div>
            <Badge className={locationBadge.className}>
              {locationBadge.label}
            </Badge>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              {locationMessage}
            </p>
            {coordinates && (
              <div className="mt-4 space-y-2 border-t border-border/60 pt-4 text-xs text-muted-foreground">
                <div className="flex items-center justify-between gap-3">
                  <span>Latitude</span>
                  <span className="font-mono text-foreground">
                    {coordinates.latitude.toFixed(5)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Longitude</span>
                  <span className="font-mono text-foreground">
                    {coordinates.longitude.toFixed(5)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Accuracy</span>
                  <span className="text-foreground">
                    {Math.round(coordinates.accuracy)}m
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
            <div className="flex gap-3">
              <ShieldCheck
                size={18}
                className="mt-0.5 shrink-0 text-primary"
                strokeWidth={1.6}
              />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Location privacy
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Only your attendance location and accuracy are saved when you
                  check in. Your location is never tracked continuously.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
            <Navigation size={13} className="text-primary" /> Location is
            captured automatically from this device.
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Attendance;
