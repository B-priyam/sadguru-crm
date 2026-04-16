"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import {
  Client,
  PipelineStage,
  Booking,
  ClientNote,
  FollowUp,
  // ActivityItem,
  Property,
  PropertyUnit,
  UnitType,
  DEFAULT_PROPERTIES,
  PIPELINE_STAGES,
} from "@/types/crm";
// import { generateMockClients } from "@/data/mockClients";
import {
  createClient,
  deleteClientAction,
  EditClientAction,
  GetClients,
  updateClientStage,
} from "@/actions/clients.action";
import { getRandomUUID } from "@/lib/helpers";
import {
  addPropertyAction,
  deletePropertyAction,
  EditPropertyAction,
  GetPropertiesAction,
} from "@/actions/properties.action";
import { toast } from "sonner";

interface CRMContextType {
  clients: Client[];
  addClient: (client: Client) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  moveClientToStage: (id: string, stage: PipelineStage) => void;
  addBooking: (clientId: string, booking: Booking) => void;
  // addNote: (clientId: string, text: string) => void;
  // addFollowUp: (clientId: string, followUp: Omit<FollowUp, "id">) => void;
  // toggleFollowUp: (clientId: string, follow: FollowUp) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  properties: Property[];
  addProperty: (property: Omit<Property, "id">) => void;
  updateProperty: (id: string, updates: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const useCRM = () => {
  const ctx = useContext(CRMContext);
  if (!ctx) throw new Error("useCRM must be used within CRMProvider");
  return ctx;
};

const locations = [
  "Sector 45",
  "Green Valley",
  "Downtown",
  "Lake View",
  "Palm Road",
  "Metro Area",
  "Garden Lane",
  "Royal Road",
  "City Center",
  "Heritage Block",
];

// const defaultProperties: Property[] = DEFAULT_PROPERTIES.map((name, i) => ({
//   id: crypto.randomUUID(),
//   name,
//   location: locations[i % locations.length],
//   units: (
//     [
//       {
//         id: crypto.randomUUID(),
//         type: "1bhk" as UnitType,
//         price: 2500000 + i * 100000,
//       },
//       {
//         id: crypto.randomUUID(),
//         type: "2bhk" as UnitType,
//         price: 4500000 + i * 150000,
//       },
//       {
//         id: crypto.randomUUID(),
//         type: "3bhk" as UnitType,
//         price: 7000000 + i * 200000,
//       },
//     ] as PropertyUnit[]
//   ).slice(0, (i % 3) + 1),
// }));

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [clients, setClients] = useState<Client[] | []>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [properties, setProperties] = useState<Property[]>([]);

  const getAllClients = async () => {
    const allClients = await GetClients();
    // console.log(allClients);
    if (allClients?.success) {
      setClients(allClients?.data as unknown as Client[]);
    } else {
      setClients([]);
    }
  };

  const getAllProperties = async () => {
    const allProperties = await GetPropertiesAction();
    if (allProperties?.success) {
      setProperties(allProperties.data as unknown as Property[]);
    } else {
      console.log("no data found");
      setProperties([]);
    }
  };

  useEffect(() => {
    getAllClients();
    getAllProperties();
  }, []);

  // const addActivity = (
  //   client: Client,
  //   activity: Omit<ActivityItem, "id" | "timestamp">,
  // ): ActivityItem[] => [
  //   {
  //     ...activity,
  //     id: crypto.randomUUID(),
  //     timestamp: new Date().toISOString(),
  //   },
  // ];

  const addClient = useCallback(async (data: Client) => {
    const tempId = await getRandomUUID();
    setClients((prev) => [...prev, { ...data, id: tempId }]);
    const newClient = await createClient({ ...data, id: tempId });
    if (!newClient?.success) {
      setClients((prev) => prev.filter((c) => c.id === tempId));
      toast.error("Error in adding new client");
    } else {
      toast.success("Client added successfully.");
    }
  }, []);

  const updateClient = useCallback(
    async (id: string, updates: Partial<Client>) => {
      const clientPrevData = clients.filter((client) => client.id === id)[0];

      // console.log(updates);
      setClients((prev) => {
        return prev.map((c) => (c.id === id ? { ...c, ...updates } : c));
      });

      const editClient = await EditClientAction(id, updates);
      if (!editClient?.success) {
        setClients((prev) => {
          return prev.map((c) => (c.id === id ? clientPrevData : c));
        });
        toast.error("Error in updating client");
      } else {
        toast.success("Client updated successfully");
      }
    },
    [clients],
  );

  const deleteClient = useCallback(
    async (id: string) => {
      const tempClient = clients.filter((client) => client.id === id)[0];
      setClients((prev) => prev.filter((c) => c.id !== id));
      const deletedClient = await deleteClientAction(id);
      setClients((prev) => prev.filter((p) => p.id !== id));
      if (!deletedClient?.success) {
        setClients((prev) => [tempClient, ...prev]);
        toast.error(
          "Error in deleting client. kindly try again after some time.",
        );
      } else {
        toast.success("Client deleted successfully.");
      }
    },
    [clients],
  );

  const moveClientToStage = useCallback(
    async (id: string, stage: PipelineStage) => {
      const prevStage = clients.filter((prev) => prev.id === id)[0].stage;

      setClients((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c;
          return {
            ...c,
            stage,
          };
        }),
      );

      const updateStage = await updateClientStage(id, stage);

      if (!updateStage?.success) {
        setClients((prev) =>
          prev.map((c) => (c.id === id ? { ...c, stage: prevStage } : c)),
        );
        toast.error("Error in updating stage");
      } else {
        toast.success("Stage updated successfully");
      }
    },
    [clients],
  );

  const addBooking = useCallback((clientId: string, booking: Booking) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== clientId) return c;
        return {
          ...c,
          booking,
          stage: "booking_confirmed" as PipelineStage,
          lastContact: new Date().toISOString(),
          // activities: addActivity(c, {
          //   type: "booking",
          //   description: `Booking confirmed: ${booking.propertyName}`,
          // }),
        };
      }),
    );
  }, []);

  // const addNote = useCallback((clientId: string, text: string) => {
  //   setClients((prev) =>
  //     prev.map((c) => {
  //       if (c.id !== clientId) return c;
  //       return {
  //         ...c,
  //         notes: c.note,
  //       };
  //     }),

  //   );
  // }, []);

  // const addFollowUp = useCallback(
  //   (clientId: string, followUp: Omit<Date, "id">) => {
  //     setClients((prev) =>
  //       prev.map((c) => {
  //         if (c.id !== clientId) return c;
  //         return {
  //           ...c,
  //           followUps: [followUp, ...c.followUp!],
  //         };
  //       }),
  //     );
  //   },
  //   [],
  // );

  const addProperty = useCallback(async (property: Property) => {
    const tempId = await getRandomUUID();
    setProperties((prev) => [...prev, { ...property, id: tempId }]);

    const newData = await addPropertyAction({ ...property, id: tempId });

    if (newData?.success) {
      toast.success("New property added successfully");
    } else {
      setProperties((prev) => {
        return prev.filter((p) => p.id !== tempId);
      });
      toast.error("Error in adding new property.");
    }
  }, []);

  const updateProperty = useCallback(
    async (id: string, updates: Partial<Property>) => {
      const prevDetail = properties.filter((prev) => prev.id === id)[0];
      setProperties((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      );
      const updatedProperty = await EditPropertyAction(id, updates);

      if (!updatedProperty?.success) {
        setProperties((prev) => {
          return prev.map((p) => (p.id === id ? prevDetail : p));
        });
        toast.error("Error in updated property");
      } else {
        toast.success("Client updated successfully");
      }
    },
    [properties],
  );

  const deleteProperty = useCallback(
    async (id: string) => {
      const prevData = properties.filter((p) => p.id === id)[0];

      setProperties((prev) => prev.filter((p) => p.id !== id));

      const deletedData = await deletePropertyAction(id);

      if (!deletedData?.success) {
        setProperties((prev) => [prevData, ...prev]);
        toast.error("Error in deleting property");
      } else {
        toast.success("Property deleted successfully");
      }
    },
    [properties],
  );

  return (
    <CRMContext.Provider
      value={{
        clients,
        addClient,
        updateClient,
        deleteClient,
        moveClientToStage,
        addBooking,
        // addNote,
        // addFollowUp,
        // toggleFollowUp,
        searchQuery,
        setSearchQuery,
        properties,
        addProperty,
        updateProperty,
        deleteProperty,
      }}
    >
      {children}
    </CRMContext.Provider>
  );
};
