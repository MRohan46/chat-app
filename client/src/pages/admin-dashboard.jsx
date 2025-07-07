import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#5b2be0", "#8b3aff", "#d946ef", "#6366f1"];

const dummyStats = {
  totalEmails: 120,
  opened: 85,
  clicked: 42,
  replies: 7,
};

const dummyOpenData = [
  { name: "Opened", value: 85 },
  { name: "Not Opened", value: 35 },
];

const dummyClickData = [
  { email: "narutoapps913@gmail.com", clicks: 5 },
  { email: "support@toolmagic.app", clicks: 3 },
  { email: "hello@impulze.ai", clicks: 2 },
];

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">📊 Email Campaign Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent><p>Total Emails</p><h2 className="text-xl font-semibold">{dummyStats.totalEmails}</h2></CardContent></Card>
        <Card><CardContent><p>Opened</p><h2 className="text-xl font-semibold">{dummyStats.opened}</h2></CardContent></Card>
        <Card><CardContent><p>Clicked</p><h2 className="text-xl font-semibold">{dummyStats.clicked}</h2></CardContent></Card>
        <Card><CardContent><p>Replied</p><h2 className="text-xl font-semibold">{dummyStats.replies}</h2></CardContent></Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="opens">
        <TabsList className="bg-muted p-2">
          <TabsTrigger value="opens">Open Rate</TabsTrigger>
          <TabsTrigger value="clicks">Top Clicks</TabsTrigger>
          <TabsTrigger value="emails">All Emails</TabsTrigger>
        </TabsList>

        {/* Pie Chart for Opens */}
        <TabsContent value="opens">
          <Card>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dummyOpenData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                    label
                  >
                    {dummyOpenData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Clicked Emails */}
        <TabsContent value="clicks">
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Clicks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dummyClickData.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell>{row.email}</TableCell>
                      <TableCell>{row.clicks}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Email Statuses */}
        <TabsContent value="emails">
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Opens</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>Replies</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(10)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>test{i}@gmail.com</TableCell>
                      <TableCell>{i % 3 === 0 ? "Sent" : "Opened"}</TableCell>
                      <TableCell>{Math.floor(Math.random() * 3)}</TableCell>
                      <TableCell>{Math.floor(Math.random() * 5)}</TableCell>
                      <TableCell>{i % 5 === 0 ? 1 : 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
