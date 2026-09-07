import { Client, Template } from "@/types/crm";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Loader2, MessageCircle, Pen, PhoneCall, Trash } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import {
  createTemplate,
  deleteTemplate,
  EditTemplate,
  GetTemplates,
} from "@/actions/template.action";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  client: Client;
  //   onClose: () => void;
}

const ContactClient: React.FC<Props> = ({ client }) => {
  const [templateId, setTemplateId] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [templateText, setTemplateText] = useState("");
  const [templateMode, setTemplateMode] = useState("Add");
  const [openTemplateDrawer, setOpenTemplateDrawer] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteAlertDialog, setDeleteAlertDialog] = useState(false);

  const openCallFunc = () => {
    window.location.href = `tel:${client.number}`;
  };

  const openWhatsAppFunc = (message: string) => {
    message = message
      .replaceAll("[CLIENT_NAME]", client.clientName)
      .replaceAll("[PROPERTY_NAME]", client.interestedProperty || "");
    window.location.href = `https://wa.me/${client.number}?text=${encodeURIComponent(message)}`;
  };

  const handleCreateTemplate = async () => {
    if (!templateText || !templateName) {
      return;
    }

    const templateData = {
      templateName,
      templateText,
    };

    const tempId = `temp-${Date.now()}`;

    const optimisticTemplate = {
      id: tempId,
      ...templateData,
      position: null,
    };

    try {
      // setIsLoading(true);

      setTemplates((prev) => [...prev, optimisticTemplate]);
      setOpenTemplateDrawer(false);

      const response = await createTemplate(templateData);

      if (!response?.status) {
        setTemplates((prev) =>
          prev.filter((template) => template.id !== tempId),
        );

        toast.error("Error in creating template");
        return;
      }

      toast.success("Template created successfully");

      if (response?.data) {
        setTemplates((prev) =>
          prev.map((template) =>
            template.id === tempId ? response.data : template,
          ),
        );
      }
    } catch (error) {
      setTemplates((prev) => prev.filter((template) => template.id !== tempId));

      toast.error("Error in creating template");
    } finally {
      // setIsLoading(false);
      setTemplateName("");
      setTemplateText("");
      setOpenTemplateDrawer(false);
    }
  };

  const handleUpdateTemplate = async () => {
    let prevData = templates;
    try {
      if (!templateId || !templateText || !templateName) {
        return;
      }
      //   setIsLoading(true);
      let templateData = {
        templateName,
        templateText,
      };
      const updatedData = templates.map((prev) =>
        prev.id === templateId
          ? { ...prev, ...templateData, id: templateId }
          : prev,
      );
      setTemplates(updatedData);
      setOpenTemplateDrawer(false);
      const response = await EditTemplate(templateId, templateData);
      if (!response?.status) {
        setTemplates(prevData);
        toast.error("Error in updating template");
      } else {
        toast.success("Template updated successfully");
      }
    } catch (error) {
      setTemplates(prevData);
      toast.error("Error in updating template");
    } finally {
      //   setIsLoading(false);
      setTemplateName("");
      setTemplateText("");
      setOpenTemplateDrawer(false);
    }
  };

  const handleDeleteClients = async () => {
    try {
      if (!templateId) {
        return;
      }
      setTemplates((prev) => prev.filter((d) => d.id !== templateId));
      const response = await deleteTemplate(templateId);
      if (!response?.status) {
        toast.error("Error in deleting template");
      } else {
        toast.success("Template deleted successfully", {
          duration: 2000,
        });
      }
    } catch (error) {
      toast.error("Error in deleting template");
    }
  };

  const getAllTemplates = async () => {
    try {
      const response = await GetTemplates();
      if (response && !response?.status) {
        toast.error("Error in fetching template");
      } else {
        setTemplates(response?.data || []);
      }
    } catch (error) {
      toast.error("Error in fetching template");
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("text copied", {
      description: "paste anywhere in the textbox",
      duration: 1000,
    });
  };

  useEffect(() => {
    getAllTemplates();
  }, []);
  return (
    <div>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
        Contact
      </p>
      <div className="flex justify-between">
        <div
          className="flex items-center gap-2 border-green-500 border px-3 py-1 rounded-xl"
          onClick={openCallFunc}
        >
          <PhoneCall color="green" size={18} />
          <p className="text-sm">Call</p>
        </div>
        <div>
          <Popover>
            <PopoverTrigger>
              <div className="flex items-center gap-2 border-cyan-500 border px-3 py-1 rounded-xl">
                <MessageCircle color="skyblue" size={18} />
                <p className="text-sm">WhatsApp</p>
              </div>
            </PopoverTrigger>

            <PopoverContent className="scroll-smooth mt-1 p-0 -ml-[15%] rounded-b-none">
              <div className="flex justify-between px-2">
                <p className="text-center pt-1.5">Select template</p>
                <Button
                  variant={"link"}
                  onClick={() => setOpenTemplateDrawer(true)}
                  className=""
                >
                  Add Template
                </Button>
              </div>
              <div className="flex flex-col max-h-32 overflow-auto">
                {templates.length > 0 ? (
                  templates.map((template) => {
                    return (
                      <div key={template.id} className="flex w-full">
                        <Button
                          className="w-[76%] rounded-none"
                          variant={"outline"}
                          onClick={() =>
                            openWhatsAppFunc(template.templateText)
                          }
                        >
                          {template.templateName}
                        </Button>
                        <Button
                          variant={"outline"}
                          className="w-[12%] rounded-none"
                          onClick={() => {
                            setTemplateName(template.templateName);
                            setTemplateText(template.templateText);
                            setTemplateId(template.id!);
                            setTemplateMode("Edit");
                            setOpenTemplateDrawer(true);
                          }}
                        >
                          <Pen />
                        </Button>
                        <Button
                          variant={"outline"}
                          className="w-[12%] rounded-none"
                          onClick={() => {
                            setTemplateId(template.id!);
                            setDeleteAlertDialog(true);
                          }}
                        >
                          <Trash />
                        </Button>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center">{"No Templates Found."}</p>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <Dialog open={openTemplateDrawer} onOpenChange={setOpenTemplateDrawer}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {templateMode == "Add" ? "Add Template" : "Edit Template"}
            </DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <Label htmlFor="templateName">Template Name</Label>
          <Input
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            id="templateName"
            placeholder="Followup message"
          />
          <div className="flex justify-between -mb-3">
            <Label htmlFor="templateText">Template Text</Label>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant={"link"} className="py-0">
                  Select Placeholders
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => handleCopyText("[CLIENT_NAME]")}
                  >
                    [CLIENT_NAME]
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleCopyText("[PROPERTY_NAME]")}
                  >
                    [PROPERTY_NAME]
                  </DropdownMenuItem>
                  {/* <DropdownMenuItem>Billing</DropdownMenuItem> */}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Textarea
            value={templateText}
            className="min-h-32"
            onChange={(e) => setTemplateText(e.target.value)}
            id="templateText"
            placeholder="Hello, [CLIENT_NAME]"
          />
          <Button
            onClick={() =>
              templateMode == "Add"
                ? handleCreateTemplate()
                : handleUpdateTemplate()
            }
            disabled={isLoading}
          >
            {isLoading ? (
              <div>
                <Loader2 />
              </div>
            ) : (
              <p>Submit</p>
            )}
          </Button>
        </DialogContent>
      </Dialog>
      <AlertDialog open={deleteAlertDialog} onOpenChange={setDeleteAlertDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              template from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteClients}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ContactClient;
