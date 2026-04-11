"use client";

import React, { useMemo } from "react";
import { useCRM } from "@/context/CRMContext";
import { formatCurrency } from "@/lib/crm-utils";
import { CalendarCheck, DollarSign, CreditCard } from "lucide-react";
import KPICard from "@/components/KPICard";

const Bookings = () => {
  return (
    <div>
      <p>THIS PAGE IS UNDER PROCESS...</p>
    </div>
  );
};
// const Bookings: React.FC = () => {
//   const { clients } = useCRM();

//   const bookingClients = useMemo(
//     () => clients.filter((c) => c.booking),
//     [clients],
//   );
//   const totalBookingValue = bookingClients.reduce(
//     (s, c) => s + (c.booking?.bookingAmount || 0),
//     0,
//   );
//   const totalCommission = bookingClients.reduce(
//     (s, c) => s + (c.booking?.commissionEarned || 0),
//     0,
//   );

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-xl font-semibold text-foreground">Bookings</h1>
//         <p className="text-sm text-muted-foreground mt-0.5">
//           Track confirmed bookings and payments.
//         </p>
//       </div>

//       <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
//         <KPICard
//           label="Total Bookings"
//           value={bookingClients.length}
//           icon={<CalendarCheck size={18} strokeWidth={1.5} />}
//         />
//         <KPICard
//           label="Booking Value"
//           value={formatCurrency(totalBookingValue)}
//           icon={<DollarSign size={18} strokeWidth={1.5} />}
//         />
//         <KPICard
//           label="Commission"
//           value={formatCurrency(totalCommission)}
//           icon={<CreditCard size={18} strokeWidth={1.5} />}
//         />
//       </div>

//       <div className="rounded-xl bg-card card-shadow overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full text-sm">
//             <thead>
//               <tr className="border-b border-border/50">
//                 <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
//                   Client
//                 </th>
//                 <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
//                   Property
//                 </th>
//                 <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
//                   Amount
//                 </th>
//                 <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
//                   Date
//                 </th>
//                 <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
//                   Status
//                 </th>
//                 <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
//                   Commission
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               {bookingClients.map((client) => (
//                 <tr
//                   key={client.id}
//                   className="border-b border-border/30 hover:bg-secondary/30 transition-colors"
//                 >
//                   <td className="py-3 px-4 font-medium text-foreground">
//                     {client.name}
//                   </td>
//                   <td className="py-3 px-4 text-muted-foreground text-xs">
//                     {client.booking?.propertyName}
//                   </td>
//                   <td className="py-3 px-4 font-mono tabular-nums text-foreground/80 hidden sm:table-cell">
//                     {formatCurrency(client.booking?.bookingAmount || 0)}
//                   </td>
//                   <td className="py-3 px-4 text-muted-foreground text-xs hidden md:table-cell">
//                     {client.booking?.bookingDate
//                       ? new Date(
//                           client.booking.bookingDate,
//                         ).toLocaleDateString()
//                       : "-"}
//                   </td>
//                   <td className="py-3 px-4">
//                     <span
//                       className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
//                         client.booking?.paymentStatus === "completed"
//                           ? "text-primary bg-primary/10"
//                           : client.booking?.paymentStatus === "partial"
//                             ? "text-accent-foreground bg-gold-bg"
//                             : "text-muted-foreground bg-secondary"
//                       }`}
//                     >
//                       {client.booking?.paymentStatus}
//                     </span>
//                   </td>
//                   <td className="py-3 px-4 font-mono tabular-nums text-foreground/80 hidden lg:table-cell">
//                     {formatCurrency(client.booking?.commissionEarned || 0)}
//                   </td>
//                 </tr>
//               ))}
//               {bookingClients.length === 0 && (
//                 <tr>
//                   <td
//                     colSpan={6}
//                     className="py-12 text-center text-sm text-muted-foreground"
//                   >
//                     No bookings yet.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

export default Bookings;
