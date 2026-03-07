import { Users, Shield, Eye, Settings } from 'lucide-react';

const mockUsers = [
  { id: 1, name: 'Admin User', email: 'admin@insightguard.io', role: 'Admin', status: 'Active', lastLogin: '2 min ago' },
  { id: 2, name: 'Hari Narayanan', email: 'harinarayanan2108@gmail.com', role: 'Operator', status: 'Active', lastLogin: '5 min ago' },
  { id: 3, name: 'Ops Team', email: 'ops@insightguard.io', role: 'Viewer', status: 'Active', lastLogin: '1h ago' },
];

const roleColors: Record<string, string> = {
  Admin: 'bg-destructive/10 text-destructive border-destructive/20',
  Operator: 'bg-neon-amber/10 text-neon-amber border-neon-amber/20',
  Viewer: 'bg-primary/10 text-primary border-primary/20',
};

const UserManagement = () => {
  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Users</span>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border text-muted-foreground bg-secondary/30">
              <th className="text-left px-4 py-2.5 font-medium">Name</th>
              <th className="text-left px-4 py-2.5 font-medium hidden md:table-cell">Email</th>
              <th className="text-left px-4 py-2.5 font-medium">Role</th>
              <th className="text-left px-4 py-2.5 font-medium hidden md:table-cell">Last Login</th>
              <th className="text-left px-4 py-2.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {mockUsers.map(user => (
              <tr key={user.id} className="border-b border-border/30 hover:bg-secondary/20">
                <td className="px-4 py-3 text-foreground font-medium">{user.name}</td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase border ${roleColors[user.role]}`}>{user.role}</span>
                </td>
                <td className="px-4 py-3 text-muted-foreground font-mono hidden md:table-cell">{user.lastLogin}</td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="text-primary text-[10px]">{user.status}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
