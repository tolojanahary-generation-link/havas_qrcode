import { useState, useEffect } from "react";
import {
  QrCode,
  Users,
  Building2,
  ScanLine,
  TrendingUp,
  Activity,
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

const weeklyData = [
  { name: "Lun", scans: 120, qrcodes: 8 },
  { name: "Mar", scans: 230, qrcodes: 12 },
  { name: "Mer", scans: 180, qrcodes: 6 },
  { name: "Jeu", scans: 290, qrcodes: 15 },
  { name: "Ven", scans: 350, qrcodes: 10 },
  { name: "Sam", scans: 200, qrcodes: 7 },
  { name: "Dim", scans: 150, qrcodes: 4 },
];

const monthlyData = [
  { name: "Jan", scans: 2450, clients: 12 },
  { name: "Fév", scans: 3200, clients: 15 },
  { name: "Mar", scans: 2800, clients: 18 },
  { name: "Avr", scans: 4100, clients: 22 },
  { name: "Mai", scans: 3800, clients: 20 },
  { name: "Juin", scans: 5200, clients: 25 },
];

const recentActivity = [
  { action: "QR Code créé", target: "Campagne Été 2026", user: "Jean Dupont", time: "Il y a 5 min" },
  { action: "Client ajouté", target: "Nestlé France", user: "Marie Martin", time: "Il y a 12 min" },
  { action: "Utilisateur activé", target: "Sophie Laurent", user: "Admin", time: "Il y a 1h" },
  { action: "QR Code scanné", target: "QR-4521", user: "—", time: "Il y a 2h" },
  { action: "Campagne terminée", target: "Printemps 2026", user: "Paul Dubois", time: "Il y a 3h" },
];

export default function AdminDashboard() {
  const [stats] = useState({
    totalQrCodes: 1284,
    activeClients: 48,
    totalUsers: 24,
    totalScans: 45280,
    scanTrend: 12.5,
    clientTrend: 8.3,
    userTrend: 4.2,
    qrTrend: 15.7,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Vue d'ensemble de la plateforme HAVAS Factory"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="QR Codes"
          value={stats.totalQrCodes.toLocaleString()}
          icon={<QrCode className="h-5 w-5" />}
          trend={stats.qrTrend}
        />
        <StatCard
          title="Clients actifs"
          value={stats.activeClients}
          icon={<Building2 className="h-5 w-5" />}
          trend={stats.clientTrend}
        />
        <StatCard
          title="Utilisateurs"
          value={stats.totalUsers}
          icon={<Users className="h-5 w-5" />}
          trend={stats.userTrend}
        />
        <StatCard
          title="Scans"
          value={stats.totalScans.toLocaleString()}
          icon={<ScanLine className="h-5 w-5" />}
          trend={stats.scanTrend}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-accent" />
              Scans hebdomadaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
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
              Évolution mensuelle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
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
                  <Line
                    type="monotone"
                    dataKey="clients"
                    stroke="#111827"
                    strokeWidth={2}
                    dot={{ fill: "#111827", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Activité récente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10">
                    <Activity className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {item.action}{" "}
                      <span className="text-muted-foreground font-normal">
                        — {item.target}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.user} · {item.time}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {item.action.split(" ")[0]}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
