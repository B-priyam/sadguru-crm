import { useCRM } from "@/context/CRMContext";

export function formatCurrency(amount: string): string {
  // console.log(amount);
  const amt = Number(amount);
  if (amt >= 10000000) return `₹${(amt / 10000000).toFixed(1)}Cr`;
  if (amt >= 100000) return `₹${(amt / 100000).toFixed(1)}L`;
  return `₹${amount.toLocaleString()}`;
}

export function formatTimeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function useFilteredClients() {
  const { clients, searchQuery } = useCRM();
  if (!searchQuery) return clients;
  const q = searchQuery.toLowerCase();
  return clients.filter(
    (c) =>
      c.clientName.toLowerCase().includes(q) ||
      // c.email.toLowerCase().includes(q) ||
      c.number.includes(q) ||
      c.interestedProperty?.toLowerCase().includes(q),
  );
}
