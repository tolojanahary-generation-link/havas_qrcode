import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import DOMPurify from "dompurify";
import { QRCodeCanvas as QRCode } from "qrcode.react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Copy,
  Download,
  Loader2,
  MoreHorizontal,
  QrCode as QrIcon,
  ExternalLink,
} from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const qrSchema = z.object({
  title: z.string().min(2, "Minimum 2 caractères"),
  url: z.string().url("URL invalide").or(z.literal("")),
  content: z.string().min(1, "Le contenu est requis"),
  clientId: z.string().optional(),
});

const initialQrCodes = [
  { id: 1, title: "Campagne Été 2026", url: "https://havas.com/ete2026", content: "https://havas.com/ete2026", client: "Nestlé France", scans: 1245, status: "actif", createdAt: "2026-05-15" },
  { id: 2, title: "Lancement Produit X", url: "https://havas.com/produit-x", content: "https://havas.com/produit-x", client: "L'Oréal Paris", scans: 3450, status: "actif", createdAt: "2026-04-20" },
  { id: 3, title: "Promo Printemps", url: "https://havas.com/printemps", content: "https://havas.com/printemps", client: "Decathlon", scans: 890, status: "inactif", createdAt: "2026-03-10" },
  { id: 4, title: "Menu Digital", url: "https://havas.com/menu", content: "https://havas.com/menu", client: "Air France", scans: 5600, status: "actif", createdAt: "2026-02-01" },
];

const clients = [
  { id: 1, name: "Nestlé France" },
  { id: 2, name: "L'Oréal Paris" },
  { id: 3, name: "Decathlon" },
  { id: 4, name: "Air France" },
];

export default function QRCodeManager() {
  const [qrCodes, setQrCodes] = useState(initialQrCodes);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewQr, setPreviewQr] = useState(null);
  const [editingQr, setEditingQr] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(qrSchema) });

  const watchedContent = watch("content", editingQr?.content || "");

  const filtered = qrCodes.filter(
    (q) =>
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.client?.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditingQr(null);
    reset({ title: "", url: "", content: "", clientId: "" });
    setIsOpen(true);
  };

  const openEdit = (qr) => {
    setEditingQr(qr);
    reset({ title: qr.title, url: qr.url || "", content: qr.content, clientId: "" });
    setIsOpen(true);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const sanitized = {
        title: DOMPurify.sanitize(data.title),
        url: DOMPurify.sanitize(data.url || ""),
        content: DOMPurify.sanitize(data.content),
      };

      if (editingQr) {
        setQrCodes((prev) =>
          prev.map((q) => (q.id === editingQr.id ? { ...q, ...sanitized } : q))
        );
        toast.success("QR Code modifié avec succès");
      } else {
        const clientName = data.clientId
          ? clients.find((c) => c.id === parseInt(data.clientId))?.name
          : "—";
        setQrCodes((prev) => [
          {
            id: Date.now(),
            ...sanitized,
            client: clientName || "—",
            scans: 0,
            status: "actif",
            createdAt: new Date().toISOString().split("T")[0],
          },
          ...prev,
        ]);
        toast.success("QR Code créé avec succès");
      }
      setIsOpen(false);
    } catch {
      toast.error("Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setQrCodes((prev) => prev.filter((q) => q.id !== id));
    setDeleteId(null);
    toast.success("QR Code supprimé");
  };

  const handleDuplicate = (qr) => {
    setQrCodes((prev) => [
      {
        ...qr,
        id: Date.now(),
        title: `${qr.title} (copie)`,
        scans: 0,
        createdAt: new Date().toISOString().split("T")[0],
      },
      ...prev,
    ]);
    toast.success("QR Code dupliqué");
  };

  const handleDownload = (qr) => {
    const canvas = document.getElementById(`qr-${qr.id}`)?.querySelector("canvas");
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `${qr.title.replace(/\s+/g, "_")}.png`;
      a.click();
      toast.success("QR Code téléchargé");
    }
  };

  const openPreview = (qr) => {
    setPreviewQr(qr);
    setPreviewOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="QR Codes" description="Gérez les QR Codes de la plateforme">
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Créer un QR Code
        </Button>
      </PageHeader>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative flex-1 max-w-sm">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Rechercher un QR Code..."
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
                <TableHead>Titre</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Scans</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Créé le</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((qr) => (
                <TableRow key={qr.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        id={`qr-${qr.id}`}
                        className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted p-1"
                      >
                        <QRCode
                          value={qr.content}
                          size={36}
                          level="L"
                          style={{ width: 36, height: 36 }}
                        />
                      </div>
                      <div>
                        <p className="font-medium">{qr.title}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {qr.content}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{qr.client || "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {qr.scans.toLocaleString()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={qr.status === "actif" ? "outline" : "destructive"}
                      className={
                        qr.status === "actif"
                          ? "text-green-600 border-green-600"
                          : ""
                      }
                    >
                      {qr.status === "actif" ? "Actif" : "Inactif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {qr.createdAt}
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
                        <DropdownMenuItem onClick={() => openPreview(qr)}>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Aperçu
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEdit(qr)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(qr)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Dupliquer
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownload(qr)}>
                          <Download className="mr-2 h-4 w-4" />
                          Télécharger
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteId(qr.id)}
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
                    Aucun QR Code trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingQr ? "Modifier le QR Code" : "Créer un QR Code"}
            </DialogTitle>
            <DialogDescription>
              {editingQr
                ? "Modifiez les informations du QR Code"
                : "Créez un nouveau QR Code pour un client"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre</Label>
                <Input
                  id="title"
                  placeholder="Campagne Été 2026"
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientId">Client (optionnel)</Label>
                <Select
                  onValueChange={(v) => setValue("clientId", v)}
                  defaultValue={editingQr?.clientId || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Contenu du QR Code</Label>
              <Textarea
                id="content"
                placeholder="https://example.com ou texte à encoder"
                rows={3}
                {...register("content")}
              />
              {errors.content && (
                <p className="text-sm text-destructive">{errors.content.message}</p>
              )}
            </div>
            {watchedContent && (
              <div className="flex justify-center rounded-lg border border-border bg-muted/50 p-4">
                <QRCode value={watchedContent} size={128} level="M" />
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingQr ? "Modification..." : "Création..."}
                  </>
                ) : editingQr ? (
                  "Modifier"
                ) : (
                  "Créer"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{previewQr?.title}</DialogTitle>
            <DialogDescription>Aperçu du QR Code</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {previewQr && (
              <>
                <QRCode value={previewQr.content} size={200} level="M" />
                <p className="text-sm text-muted-foreground text-center break-all max-w-[250px]">
                  {previewQr.content}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(previewQr)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Télécharger
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDuplicate(previewQr)}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Dupliquer
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce QR Code ? Cette action est
              irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteId(null)}>
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => handleDelete(deleteId)}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
