import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Shield, Users, UserX, UserCheck, RefreshCw, Search, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type UserRow = {
  id: string;
  email: string | null;
  user_metadata?: Record<string, any>;
  created_at?: string;
};

const Admin: React.FC = () => {
  const { user, session } = useAuth();
  const { language } = useLanguage();
  const isAdmin = Boolean(user?.user_metadata?.is_admin || (user as any)?.role === 'admin');

  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionDialog, setActionDialog] = useState<{ open: boolean; userId: string; action: 'ban' | 'unban' } | null>(null);

  const FUNCTIONS_BASE = (import.meta.env.VITE_SUPABASE_FUNCTIONS_URL as string) || 'http://localhost:54321/functions/v1';

  useEffect(() => {
    if (!isAdmin) return;
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${FUNCTIONS_BASE}/list-users`, {
        headers: {
          'content-type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
      });
      if (!res.ok) throw new Error(`Failed to fetch users: ${res.statusText}`);
      const body = await res.json();
      setUsers(body.users || []);
      toast.success(language === 'en' ? 'Users loaded successfully' : 'Benutzer erfolgreich geladen');
    } catch (err: any) {
      toast.error(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  };

  const toggleBan = async (userId: string, ban: boolean) => {
    try {
      const res = await fetch(`${FUNCTIONS_BASE}/toggle-user`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ userId, action: ban ? 'ban' : 'unban' }),
      });
      if (!res.ok) throw new Error('Action failed');
      await fetchUsers();
      toast.success(
        language === 'en'
          ? `User ${ban ? 'banned' : 'unbanned'} successfully`
          : `Benutzer erfolgreich ${ban ? 'gesperrt' : 'entsperrt'}`
      );
    } catch (err: any) {
      toast.error(err?.message ?? String(err));
    } finally {
      setActionDialog(null);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    const query = searchQuery.toLowerCase();
    return users.filter((u) =>
      u.email?.toLowerCase().includes(query) ||
      u.id.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  const stats = useMemo(() => {
    const totalUsers = users.length;
    const adminUsers = users.filter((u) => u.user_metadata?.is_admin).length;
    const bannedUsers = users.filter((u) => u.user_metadata?.is_banned).length;
    const activeUsers = totalUsers - bannedUsers;
    return { totalUsers, adminUsers, bannedUsers, activeUsers };
  }, [users]);

  if (!isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-8">
        <Card className="max-w-2xl w-full bg-gradient-to-br from-background/95 to-muted/50 backdrop-blur-xl border-2 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
              <Shield className="w-10 h-10 text-destructive" />
            </div>
            <CardTitle className="text-3xl font-bold">
              {language === 'en' ? 'Access Denied' : 'Zugriff verweigert'}
            </CardTitle>
            <CardDescription className="text-base">
              {language === 'en'
                ? 'You do not have permission to view this page.'
                : 'Sie haben keine Berechtigung, diese Seite anzuzeigen.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            <p className="text-sm">
              {language === 'en'
                ? 'If you should have access, ensure your user has an is_admin flag in user metadata.'
                : 'Wenn Sie Zugriff haben sollten, stellen Sie sicher, dass Ihr Benutzer ein is_admin-Flag in den Benutzermetadaten hat.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {language === 'en' ? 'Admin Dashboard' : 'Admin-Dashboard'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {language === 'en' ? 'Signed in as' : 'Angemeldet als'}: <span className="font-medium text-foreground">{user?.email}</span>
          </p>
        </div>
        <Button onClick={fetchUsers} disabled={loading} size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-all">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? (language === 'en' ? 'Refreshing...' : 'Aktualisieren...') : (language === 'en' ? 'Refresh' : 'Aktualisieren')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20 hover:shadow-lg transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              {language === 'en' ? 'Total Users' : 'Benutzer gesamt'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20 hover:shadow-lg transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-green-500" />
              {language === 'en' ? 'Active Users' : 'Aktive Benutzer'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.activeUsers}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20 hover:shadow-lg transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-500" />
              {language === 'en' ? 'Administrators' : 'Administratoren'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{stats.adminUsers}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20 hover:shadow-lg transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <UserX className="w-4 h-4 text-red-500" />
              {language === 'en' ? 'Banned Users' : 'Gesperrte Benutzer'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.bannedUsers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="bg-gradient-to-br from-background/95 to-muted/30 backdrop-blur-xl border shadow-xl">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                {language === 'en' ? 'User Management' : 'Benutzerverwaltung'}
              </CardTitle>
              <CardDescription className="mt-2">
                {language === 'en' ? 'Manage all platform users' : 'Alle Plattformbenutzer verwalten'}
              </CardDescription>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={language === 'en' ? 'Search by email or ID...' : 'Nach E-Mail oder ID suchen...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background/50 backdrop-blur"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">{language === 'en' ? 'Email' : 'E-Mail'}</TableHead>
                  <TableHead className="font-semibold">{language === 'en' ? 'Created' : 'Erstellt'}</TableHead>
                  <TableHead className="font-semibold">{language === 'en' ? 'Role' : 'Rolle'}</TableHead>
                  <TableHead className="font-semibold">{language === 'en' ? 'Status' : 'Status'}</TableHead>
                  <TableHead className="font-semibold text-right">{language === 'en' ? 'Actions' : 'Aktionen'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {language === 'en' ? 'No users found' : 'Keine Benutzer gefunden'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((u) => (
                    <TableRow key={u.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">{u.email ?? u.id}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
                        {u.user_metadata?.is_admin ? (
                          <Badge className="bg-purple-500/10 text-purple-700 border-purple-500/20 hover:bg-purple-500/20">
                            <Shield className="w-3 h-3 mr-1" />
                            Admin
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            {language === 'en' ? 'User' : 'Benutzer'}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {u.user_metadata?.is_banned ? (
                          <Badge variant="destructive" className="gap-1">
                            <UserX className="w-3 h-3" />
                            {language === 'en' ? 'Banned' : 'Gesperrt'}
                          </Badge>
                        ) : (
                          <Badge className="bg-green-500/10 text-green-700 border-green-500/20 hover:bg-green-500/20 gap-1">
                            <UserCheck className="w-3 h-3" />
                            {language === 'en' ? 'Active' : 'Aktiv'}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          {!u.user_metadata?.is_banned ? (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setActionDialog({ open: true, userId: u.id, action: 'ban' })}
                              className="gap-1"
                            >
                              <UserX className="w-3 h-3" />
                              {language === 'en' ? 'Ban' : 'Sperren'}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => setActionDialog({ open: true, userId: u.id, action: 'unban' })}
                              className="gap-1 bg-green-600 hover:bg-green-700"
                            >
                              <UserCheck className="w-3 h-3" />
                              {language === 'en' ? 'Unban' : 'Entsperren'}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={actionDialog?.open ?? false} onOpenChange={(open) => !open && setActionDialog(null)}>
        <AlertDialogContent className="bg-background/95 backdrop-blur-xl border shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'en' ? 'Confirm Action' : 'Aktion bestätigen'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionDialog?.action === 'ban'
                ? language === 'en'
                  ? 'Are you sure you want to ban this user? They will lose access to the platform.'
                  : 'Möchten Sie diesen Benutzer wirklich sperren? Sie verlieren den Zugriff auf die Plattform.'
                : language === 'en'
                  ? 'Are you sure you want to unban this user? They will regain access to the platform.'
                  : 'Möchten Sie diesen Benutzer wirklich entsperren? Sie erhalten wieder Zugriff auf die Plattform.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{language === 'en' ? 'Cancel' : 'Abbrechen'}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => actionDialog && toggleBan(actionDialog.userId, actionDialog.action === 'ban')}
              className={actionDialog?.action === 'ban' ? 'bg-destructive hover:bg-destructive/90' : 'bg-green-600 hover:bg-green-700'}
            >
              {language === 'en' ? 'Confirm' : 'Bestätigen'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;
