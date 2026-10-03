"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  Download,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Target,
  UserCog,
  Users,
  UserRoundCheck,
  UserRoundX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import KPICard from "@/components/KPICard";
import { getInitials } from "@/lib/crm-utils";
import { createEmployee, GetEmployees } from "@/actions/employee.action";
import { toast } from "sonner";
import { Employee } from "@/types/crm";

type EmployeeStatus = "active" | "on_leave" | "inactive";

type PermissionKey =
  | "add_employee"
  | "edit_employee"
  | "delete_employee"
  | "manage_roles"
  | "view_clients"
  | "add_client"
  | "edit_client"
  | "delete_client"
  | "view_properties"
  | "add_property"
  | "edit_property"
  | "delete_property"
  | "view_bookings"
  | "manage_bookings"
  | "manage_visits"
  | "view_attendance"
  | "manage_attendance"
  | "view_analytics";

interface PermissionDefinition {
  key: PermissionKey;
  label: string;
  description: string;
}

interface PermissionGroup {
  label: string;
  permissions: PermissionDefinition[];
}

const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    label: "Team & access",
    permissions: [
      {
        key: "add_employee",
        label: "Add employees",
        description: "Create new employee records",
      },
      {
        key: "edit_employee",
        label: "Edit employees",
        description: "Update employee details and status",
      },
      {
        key: "delete_employee",
        label: "Delete employees",
        description: "Remove employee records",
      },
      {
        key: "manage_roles",
        label: "Manage roles",
        description: "Create roles and assign permissions",
      },
    ],
  },
  {
    label: "Clients",
    permissions: [
      {
        key: "view_clients",
        label: "View clients",
        description: "See client records and details",
      },
      {
        key: "add_client",
        label: "Add clients",
        description: "Create new client records",
      },
      {
        key: "edit_client",
        label: "Edit clients",
        description: "Update client records and stages",
      },
      {
        key: "delete_client",
        label: "Delete clients",
        description: "Remove client records",
      },
    ],
  },
  {
    label: "Properties",
    permissions: [
      {
        key: "view_properties",
        label: "View properties",
        description: "See properties and available units",
      },
      {
        key: "add_property",
        label: "Add properties",
        description: "Create new property listings",
      },
      {
        key: "edit_property",
        label: "Edit properties",
        description: "Update property and unit details",
      },
      {
        key: "delete_property",
        label: "Delete properties",
        description: "Remove property listings",
      },
    ],
  },
  {
    label: "Bookings & visits",
    permissions: [
      {
        key: "view_bookings",
        label: "View bookings",
        description: "See booking and deal information",
      },
      {
        key: "manage_bookings",
        label: "Manage bookings",
        description: "Update booking details and payments",
      },
      {
        key: "manage_visits",
        label: "Manage visits",
        description: "Schedule and update property visits",
      },
    ],
  },
  {
    label: "Attendance & reports",
    permissions: [
      {
        key: "view_attendance",
        label: "View attendance",
        description: "See attendance records",
      },
      {
        key: "manage_attendance",
        label: "Manage attendance",
        description: "Correct and manage team attendance",
      },
      {
        key: "view_analytics",
        label: "View analytics",
        description: "See performance and revenue reports",
      },
    ],
  },
];

const ALL_PERMISSION_KEYS = PERMISSION_GROUPS.flatMap((group) =>
  group.permissions.map((permission) => permission.key),
);
const EMPLOYEES_STORAGE_KEY = "estateflow-employees";

// interface Employee {
//   id: string;
//   name: string;
//   email: string;
//   phone: string;
//   role: string;
//   department: string;
//   status: EmployeeStatus;
//   joined: string;
//   leads: number;
//   conversion: number;
//   revenue: number;
//   permissions: PermissionKey[];
// }

type EmployeeForm = Omit<
  Employee,
  "id" | "joined" | "leads" | "conversion" | "revenue"
>;

const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: "emp-1",
    name: "Aarav Mehta",
    email: "aarav@estateflow.in",
    number: "+91 98765 41230",
    role: "Senior Property Advisor",
    // department: "Sales",
    status: "active",
    createdAt: new Date("2023-04-12"),
    leads: "34",
    // conversion: 29,
    // revenue: 18400000,
    permissions: [
      "view_clients",
      "add_client",
      "edit_client",
      "view_properties",
      "view_bookings",
      "manage_visits",
      "view_analytics",
    ],
    bookings: "0",
  },
  {
    id: "emp-2",
    name: "Ishita Sharma",
    email: "ishita@estateflow.in",
    number: "+91 98110 76542",
    role: "Property Advisor",
    // department: "Sales",
    status: "active",
    createdAt: new Date("2023-08-21"),
    // leads: 27,
    // conversion: 24,
    // revenue: 12800000,
    permissions: [
      "view_clients",
      "add_client",
      "edit_client",
      "view_properties",
      "manage_visits",
    ],
    bookings: "0",
    leads: "0",
  },
  {
    id: "emp-3",
    name: "Rohan Kapoor",
    email: "rohan@estateflow.in",
    number: "+91 98990 33441",
    role: "Sales Manager",
    // department: "Sales",
    status: "active",
    createdAt: new Date("2022-11-08"),
    leads: "41",
    // conversion: 31,
    // revenue: 22100000,
    permissions: [...ALL_PERMISSION_KEYS],
    bookings: "0",
  },
  {
    id: "emp-4",
    name: "Meera Nair",
    email: "meera@estateflow.in",
    number: "+91 98470 22118",
    role: "Customer Success Lead",
    // department: "Customer Success",
    status: "on_leave",
    createdAt: new Date("2024-01-15"),
    leads: "18",
    // conversion: 22,
    // revenue: 7600000,
    permissions: [
      "view_clients",
      "edit_client",
      "view_bookings",
      "manage_bookings",
      "manage_visits",
      "view_attendance",
    ],
    bookings: "0",
  },
  {
    id: "emp-5",
    name: "Kabir Singh",
    email: "kabir@estateflow.in",
    number: "+91 98200 55104",
    role: "Marketing Specialist",
    // department: "Marketing",
    status: "active",
    createdAt: new Date("2024-03-04"),
    leads: "22",
    // conversion: 18,
    // revenue: 9400000,
    permissions: [
      "view_clients",
      "add_client",
      "view_properties",
      "view_analytics",
    ],
    bookings: "0",
  },
  {
    id: "emp-6",
    name: "Ananya Roy",
    email: "ananya@estateflow.in",
    number: "+91 98310 11983",
    role: "Operations Coordinator",
    // department: "Operations",
    status: "inactive",
    createdAt: new Date("2022-07-19"),
    leads: "9",
    // conversion: 12,
    // revenue: 3200000,
    permissions: [
      "view_attendance",
      "manage_attendance",
      "view_properties",
      "edit_property",
      "manage_visits",
    ],
    bookings: "0",
  },
];

const EMPTY_FORM: EmployeeForm = {
  name: "",
  email: "",
  number: "",
  role: "",
  // department: "Sales",
  status: "active",
  permissions: [],
  bookings: "0",
  createdAt: new Date(),
};

const STATUS_LABELS: Record<EmployeeStatus, string> = {
  active: "Active",
  on_leave: "On leave",
  inactive: "Inactive",
};

const formatRevenue = (value: number) => {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  return `₹${(value / 100000).toFixed(1)}L`;
};

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const stored = window.localStorage.getItem(EMPLOYEES_STORAGE_KEY);
      if (!stored) return INITIAL_EMPLOYEES;
      const parsed = JSON.parse(stored) as Employee[];
      return parsed.map((employee) => ({
        ...employee,
        permissions: employee.permissions ?? [],
      }));
    } catch {
      return INITIAL_EMPLOYEES;
    }
  });
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EmployeeForm>(EMPTY_FORM);

  useEffect(() => {
    window.localStorage.setItem(
      EMPLOYEES_STORAGE_KEY,
      JSON.stringify(employees),
    );
  }, [employees]);

  const departments = useMemo(
    () => Array.from(new Set(employees.map((employee) => employee.role))),
    [employees],
  );

  const filteredEmployees = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return employees.filter((employee) => {
      const matchesQuery =
        !normalizedQuery ||
        [
          employee.name,
          employee.email,
          employee.role,
          // employee.department,
        ].some((value) => value.toLowerCase().includes(normalizedQuery));
      const matchesStatus =
        statusFilter === "all" || employee.status === statusFilter;
      // const matchesDepartment =
      // departmentFilter === "all" || employee.department === departmentFilter;
      return matchesQuery && matchesStatus;
    });
  }, [employees, query, statusFilter]);

  const activeCount = employees.filter(
    (employee) => employee.status === "active",
  ).length;
  const leaveCount = employees.filter(
    (employee) => employee.status === "on_leave",
  ).length;
  // const totalRevenue = employees.reduce(
  //   (sum, employee) => sum + employee.revenue,
  //   0,
  // );
  // const averageConversion = Math.round(
  //   employees.reduce((sum, employee) => sum + employee.conversion, 0) /
  //     employees.length,
  // );

  const openAddDialog = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEditDialog = (employee: Employee) => {
    setEditingId(employee.id!);
    setForm({
      name: employee.name,
      email: employee.email,
      number: employee.number,
      role: employee.role,
      // department: employee.department,
      status: employee.status,
      permissions: employee.permissions,
      bookings: employee.bookings,
      createdAt: employee.createdAt,
    });
    setDialogOpen(true);
  };

  const updateStatus = (id: string, status: EmployeeStatus) => {
    setEmployees((current) =>
      current.map((employee) =>
        employee.id === id ? { ...employee, status } : employee,
      ),
    );
  };

  const saveEmployee = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.role.trim()) return;

    if (editingId) {
      setEmployees((current) =>
        current.map((employee) =>
          employee.id === editingId ? { ...employee, ...form } : employee,
        ),
      );
    } else {
      setEmployees((current) => [
        {
          ...form,
          id: crypto.randomUUID(),
          // joined: new Date().toISOString().slice(0, 10),
          // conversion: 0,
          // revenue: 0,
          createdAt: new Date(),
          permissions: [...form.permissions],
          leads: "0",
        },
        ...current,
      ]);
    }
    await createEmployee({
      email: form.email,
      name: form.name,
      number: form.number,
      permissions: form.permissions,
      role: form.role,
      status: form.status,
      createdAt: new Date(),
      bookings: "0",
      leads: "0",
    });
    setDialogOpen(false);
  };

  const exportEmployees = () => {
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Role",
      "Department",
      "Status",
      "Assigned Leads",
      "Conversion",
      "Revenue",
    ];
    const rows = filteredEmployees.map((employee) => [
      employee.name,
      employee.email,
      employee.number,
      employee.role,
      // employee.department,
      // STATUS_LABELS[employee.status],
      employee.leads,
      // `${employee.conversion}%`,
      // formatRevenue(employee.revenue),
    ]);
    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "estateflow-team.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const getAllEployees = async () => {
    try {
      const employees = await GetEmployees();
      if (employees?.status == 200) {
        setEmployees(employees.data);
      }
    } catch (error) {
      toast.error("Error in fetching employees list");
    }
  };

  useEffect(() => {
    getAllEployees();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-primary mb-1">
            <UserCog size={16} strokeWidth={1.8} />
            <span className="text-xs font-semibold uppercase tracking-[0.14em]">
              People operations
            </span>
          </div>
          <h1 className="text-xl font-semibold text-foreground">
            Employee Management
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your team, performance, and access in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={exportEmployees}
            variant="outline"
            size="sm"
            className="gap-1.5"
          >
            <Download size={14} strokeWidth={1.6} /> Export
          </Button>
          <Button onClick={openAddDialog} size="sm" className="gap-1.5">
            <Plus size={14} strokeWidth={1.6} /> Add employee
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KPICard
          label="Team members"
          value={employees.length}
          icon={<Users size={18} strokeWidth={1.5} />}
        />
        <KPICard
          label="Active now"
          value={activeCount}
          icon={<UserRoundCheck size={18} strokeWidth={1.5} />}
        />
        <KPICard
          label="On leave"
          value={leaveCount}
          icon={<UserRoundX size={18} strokeWidth={1.5} />}
        />
        {/* <KPICard
          label="Pipeline managed"
          value={formatRevenue(totalRevenue)}
          icon={<Target size={18} strokeWidth={1.5} />}
        /> */}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <section className="min-w-0 space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search people, roles, or departments..."
                className="h-9 pl-9 text-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-full text-sm sm:w-[142px]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="on_leave">On leave</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={departmentFilter}
              onValueChange={setDepartmentFilter}
            >
              <SelectTrigger className="h-9 w-full text-sm sm:w-[155px]">
                <SelectValue placeholder="All departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All departments</SelectItem>
                {departments.map((department) => (
                  <SelectItem key={department} value={department}>
                    {department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-hidden rounded-xl bg-card card-shadow">
            {filteredEmployees.length === 0 ? (
              <div className="py-14 text-center">
                <Users
                  size={32}
                  className="mx-auto mb-2 text-muted-foreground/40"
                />
                <p className="text-sm text-muted-foreground">
                  No employees match these filters.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="h-10 text-xs">Employee</TableHead>
                    <TableHead className="h-10 text-xs hidden md:table-cell">
                      Role & department
                    </TableHead>
                    <TableHead className="h-10 text-xs text-right hidden sm:table-cell">
                      Leads
                    </TableHead>
                    <TableHead className="h-10 text-xs text-right hidden lg:table-cell">
                      Conversion
                    </TableHead>
                    <TableHead className="h-10 text-xs text-right hidden lg:table-cell">
                      Revenue
                    </TableHead>
                    <TableHead className="h-10 text-xs">Status</TableHead>
                    <TableHead className="h-10 text-xs hidden sm:table-cell">
                      Access
                    </TableHead>
                    <TableHead className="h-10 w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="py-3">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {getInitials(employee.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">
                              {employee.name}
                            </p>
                            <p className="truncate text-[11px] text-muted-foreground sm:hidden">
                              {employee.role}
                            </p>
                            <p className="hidden truncate text-[11px] text-muted-foreground sm:block">
                              {employee.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden py-3 md:table-cell">
                        <p className="text-sm text-foreground">
                          {employee.role}
                        </p>
                        {/* <p className="text-[11px] text-muted-foreground">
                          {employee.department}
                        </p> */}
                      </TableCell>
                      <TableCell className="hidden py-3 text-right text-sm tabular-nums sm:table-cell">
                        {employee.leads}
                      </TableCell>
                      {/* <TableCell className="hidden py-3 text-right text-sm font-medium tabular-nums text-primary lg:table-cell">
                        {employee.conversion}%
                      </TableCell> */}
                      {/* <TableCell className="hidden py-3 text-right text-sm font-medium tabular-nums lg:table-cell">
                        {formatRevenue(employee.revenue)}
                      </TableCell> */}
                      <TableCell className="py-3">
                        <Select
                          value={employee.status}
                          onValueChange={(value) =>
                            updateStatus(employee.id!, value as EmployeeStatus)
                          }
                        >
                          <SelectTrigger className="h-7 w-[98px] border-0 bg-transparent px-0 text-xs focus:ring-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="on_leave">On leave</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="hidden py-3 sm:table-cell">
                        <Badge
                          variant="outline"
                          className="text-[11px] font-normal"
                        >
                          {employee.permissions.length}/
                          {ALL_PERMISSION_KEYS.length} permissions
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 pr-3 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(employee)}
                          aria-label={`Edit ${employee.name}`}
                        >
                          <MoreHorizontal size={16} strokeWidth={1.6} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-xl bg-card p-4 card-shadow">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Team performance
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  This quarter
                </p>
              </div>
              <Activity size={17} className="text-primary" strokeWidth={1.6} />
            </div>
            <div className="space-y-4">
              <div>
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="text-muted-foreground">Avg. conversion</span>
                  {/* <span className="font-semibold text-foreground">
                    {averageConversion}%
                  </span> */}
                </div>
                {/* <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${Math.min(averageConversion * 2.5, 100)}%`,
                    }}
                  />
                </div> */}
              </div>
              <div>
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="text-muted-foreground">Active capacity</span>
                  <span className="font-semibold text-foreground">
                    {activeCount}/{employees.length}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{
                      width: `${(activeCount / employees.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="mt-5 border-t border-border/60 pt-4">
              <p className="mb-3 text-xs font-medium text-muted-foreground">
                Top contributors
              </p>
              <div className="space-y-3">
                {[...employees]
                  // .sort((a, b) => b.revenue - a.revenue)
                  .slice(0, 3)
                  .map((employee, index) => (
                    <div key={employee.id} className="flex items-center gap-2">
                      <span className="w-4 text-center text-[11px] font-semibold text-muted-foreground">
                        0{index + 1}
                      </span>
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                        {getInitials(employee.name)}
                      </div>
                      <span className="min-w-0 flex-1 truncate text-xs text-foreground">
                        {employee.name}
                      </span>
                      {/* <span className="text-xs font-medium tabular-nums text-muted-foreground">
                        {formatRevenue(employee.revenue)}
                      </span> */}
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex gap-3">
              <BriefcaseBusiness
                size={18}
                className="mt-0.5 flex-shrink-0 text-primary"
                strokeWidth={1.6}
              />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Keep your roster current
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Update availability as your team changes so lead assignments
                  stay accurate.
                </p>
                <Button
                  variant="link"
                  size="sm"
                  onClick={openAddDialog}
                  className="mt-2 h-auto p-0 text-xs"
                >
                  Add a teammate <ArrowUpRight size={12} />
                </Button>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit employee" : "Add employee"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update this team member’s role or availability."
                : "Create a team profile for lead assignment and performance tracking."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={saveEmployee} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="employee-name">Full name</Label>
                <Input
                  id="employee-name"
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="e.g. Neha Verma"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="employee-email">Work email</Label>
                <div className="relative">
                  <Mail
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="employee-email"
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      setForm({ ...form, email: event.target.value })
                    }
                    className="pl-9"
                    placeholder="name@company.com"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="employee-phone">Phone</Label>
                <div className="relative">
                  <Phone
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="employee-phone"
                    value={form.number}
                    onChange={(event) =>
                      setForm({ ...form, number: event.target.value })
                    }
                    className="pl-9"
                    placeholder="+91 00000 00000"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="employee-role">Role</Label>
                <Input
                  id="employee-role"
                  value={form.role}
                  onChange={(event) =>
                    setForm({ ...form, role: event.target.value })
                  }
                  placeholder="e.g. Property Advisor"
                  required
                />
              </div>
              {/* <div className="space-y-1.5">
                <Label>Department</Label>
                <Select
                  value={form.department}
                  onValueChange={(department) =>
                    setForm({ ...form, department })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Customer Success">
                      Customer Success
                    </SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}
              <div className="space-y-1.5">
                <Label>Availability</Label>
                <Select
                  value={form.status}
                  onValueChange={(status) =>
                    setForm({ ...form, status: status as EmployeeStatus })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on_leave">On leave</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-3 border-t border-border/60 pt-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <Label className="text-sm">Platform permissions</Label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Choose exactly what this employee can view, add, edit, or
                    delete.
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs"
                    onClick={() =>
                      setForm({
                        ...form,
                        permissions: [...ALL_PERMISSION_KEYS],
                      })
                    }
                  >
                    Select all
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs"
                    onClick={() => setForm({ ...form, permissions: [] })}
                  >
                    Clear all
                  </Button>
                </div>
              </div>
              <div className="space-y-4 rounded-lg border border-border/70 p-3 sm:p-4">
                {PERMISSION_GROUPS.map((group) => (
                  <div key={group.label} className="space-y-2.5">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      {group.label}
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {group.permissions.map((permission) => {
                        const checked = form.permissions.includes(
                          permission.key,
                        );
                        return (
                          <label
                            key={permission.key}
                            className="flex cursor-pointer items-start gap-2.5 rounded-md p-2 transition-colors hover:bg-secondary/60"
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(value) =>
                                setForm({
                                  ...form,
                                  permissions:
                                    value === true
                                      ? [...form.permissions, permission.key]
                                      : form.permissions.filter(
                                          (key) => key !== permission.key,
                                        ),
                                })
                              }
                            />
                            <span className="min-w-0">
                              <span className="block text-xs font-medium text-foreground">
                                {permission.label}
                              </span>
                              <span className="mt-0.5 block text-[11px] leading-relaxed text-muted-foreground">
                                {permission.description}
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {form.permissions.length} of {ALL_PERMISSION_KEYS.length}{" "}
                permissions selected
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                <Check size={14} />{" "}
                {editingId ? "Save changes" : "Add employee"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Employees;
