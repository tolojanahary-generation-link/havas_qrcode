import { useState } from "react";
import {
  QrCode,
  ScanLine,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import PageHeader from "@/components/shared/PageHeader";
import StatCard from "@/components/shared/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QRCodeCanvas as QRCode } from "qrcode.react";

const weeklyData = [
  { name: "Lun", scans: 45 },
  { name: "Mar", scans: 78 },
  { name: "Mer", scans: 52 },
  { name: "Jeu", scans: 91 },
  { name: "Ven", scans: 120 },
  { name: "Sam", scans: 65 },
  { name: "Dim", scans: 38 },
];

const recentQrCodes = [
  { id: 1, title: "Campagne Été 2026", content: "https://havas.com/ete2026", scans: 1245, createdAt: "2026-05-15" },
  { id: 2, title: "Promo Juin", content: "https://havas.com/promo-juin", scans: 890, createdAt: "2026-05-10" },
  { id: 3, title: "Lien Catalogue", content: "https://havas.com/catalogue", scans: 456, createdAt: "2026-05-05" },
];

export default function ClientDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Vue d'ensemble de vos QR Codes et performances"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Mes QR Codes"
          value="24"
          icon={<QrCode className="h-5 w-5" />}
          trend={12}
        />
        <StatCard
          title="Scans totaux"
          value="8 450"
          icon={<ScanLine className="h-5 w-5" />}
          trend={23.5}
        />
        <StatCard
          title="Performance"
          value="+18%"
          icon={<TrendingUp className="h-5 w-5" />}
          trend={18}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ScanLine className="h-5 w-5 text-accent" />
              Scans cette semaine
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar
                    dataKey="scans"
                    fill="#FF6B00"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-accent" />
              Performances
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[
                    { name: "Sem 1", scans: 320 },
                    { name: "Sem 2", scans: 450 },
                    { name: "Sem 3", scans: 380 },
                    { name: "Sem 4", scans: 520 },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="scans"
                    stroke="#FF6B00"
                    strokeWidth={2}
                    dot={{ fill: "#FF6B00", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Mes derniers QR Codes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentQrCodes.map((qr) => (
              <div
                key={qr.id}
                className="rounded-xl border bg-card p-4 transition-all hover:shadow-md"
              >
                <div className="flex justify-center mb-3">
                  <QRCode value={qr.content} size={100} level="M" />
                </div>
                <h3 className="text-sm font-medium text-center truncate">
                  {qr.title}
                </h3>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{qr.scans.toLocaleString()} scans</span>
                  <span>{qr.createdAt}</span>
                </div>
                <Button variant="ghost" size="xs" className="mt-2 w-full gap-1">
                  <ArrowUpRight className="h-3 w-3" />
                  Détails
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
