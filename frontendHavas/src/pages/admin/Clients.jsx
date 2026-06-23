import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import DOMPurify from "dompurify";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  MoreHorizontal,
  Building2,
} from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";

const clientSchema = z.object({
  company: z.string().min(2, "Minimum 2 caractères"),
  contact: z.string().min(2, "Minimum 2 caractères"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
});

const initialClients = [
  { id: 1, company: "Nestlé France", contact: "Marc Dubois", email: "marc.dubois@nestle.fr", phone: "+33 1 23 45 67 89", qrCodes: 45, status: "actif" },
  { id: 2, company: "L'Oréal Paris", contact: "Sophie Bernard", email: "sophie.bernard@loreal.com", phone: "+33 1 98 76 54 32", qrCodes: 128, status: "actif" },
  { id: 3, company: "TotalEnergies", contact: "Lucas Petit", email: "lucas.petit@totalenergies.com", phone: "+33 1 45 67 89 01", qrCodes: 32, status: "inactif" },
  { id: 4, company: "Air France", contact: "Emma Richard", email: "emma.richard@airfrance.fr", phone: "+33 1 34 56 78 90", qrCodes: 89, status: "actif" },
  { id: 5, company: "Decathlon", contact: "Thomas Martin", email: "thomas.martin@decathlon.com", phone: "+33 1 56 78 90 12", qrCodes: 210, status: "actif" },
];

export default function AdminClients() {
  const [clients, setClients] = useState(initialClients);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(clientSchema) });

  const filtered = clients.filter(
    (c) =>
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.contact.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditingClient(null);
    reset({ company: "", contact: "", email: "", phone: "" });
    setIsOpen(true);
  };

  const openEdit = (client) => {
    setEditingClient(client);
    reset({
      company: client.company,
      contact: client.contact,
      email: client.email,
      phone: client.phone || "",
    });
    setIsOpen(true);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const sanitized = {
        company: DOMPurify.sanitize(data.company),
        contact: DOMPurify.sanitize(data.contact),
        email: DOMPurify.sanitize(data.email),
        phone: DOMPurify.sanitize(data.phone || ""),
      };

      if (editingClient) {
        setClients((prev) =>
          prev.map((c) => (c.id === editingClient.id ? { ...c, ...sanitized } : c))
        );
        toast.success("Client modifié avec succès");
      } else {
        setClients((prev) => [
          ...prev,
          { id: Date.now(), ...sanitized, qrCodes: 0, status: "actif" },
        ]);
        toast.success("Client créé avec succès");
      }
      setIsOpen(false);
    } catch {
      toast.error("Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
    setDeleteId(null);
    toast.success("Client supprimé");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Clients" description="Gérez les clients de la plateforme">
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un client
        </Button>
      </PageHeader>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>QR Codes</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                        <Building2 className="h-4 w-4 text-accent" />
                      </div>
                      <span className="font-medium">{client.company}</span>
                    </div>
                  </TableCell>
                  <TableCell>{client.contact}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {client.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{client.qrCodes}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={client.status === "actif" ? "outline" : "destructive"}
                      className={
                        client.status === "actif"
                          ? "text-green-600 border-green-600"
                          : ""
                      }
                    >
                      {client.status === "actif" ? "Actif" : "Inactif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openEdit(client)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteId(client.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Aucun client trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingClient ? "Modifier le client" : "Ajouter un client"}
            </DialogTitle>
            <DialogDescription>
              {editingClient
                ? "Modifiez les informations du client"
                : "Ajoutez un nouveau client à la plateforme"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company">Nom de l'entreprise</Label>
              <Input id="company" placeholder="Nestlé France" {...register("company")} />
              {errors.company && (
                <p className="text-sm text-destructive">{errors.company.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact">Contact principal</Label>
              <Input id="contact" placeholder="Jean Dupont" {...register("contact")} />
              {errors.contact && (
                <p className="text-sm text-destructive">{errors.contact.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="contact@entreprise.com" {...register("email")} />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone (optionnel)</Label>
              <Input id="phone" type="tel" placeholder="+33 1 23 45 67 89" {...register("phone")} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingClient ? "Modification..." : "Création..."}
                  </>
                ) : editingClient ? (
                  "Modifier"
                ) : (
                  "Créer"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteId(null)}>
              Annuler
            </Button>
            <Button type="button" variant="destructive" onClick={() => handleDelete(deleteId)}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
