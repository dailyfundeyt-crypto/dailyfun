import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { BarChart3, Users, MessageCircle, FileText } from 'lucide-react';

const Messages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground mb-8">Übersicht über deine Aktivitäten</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/analytics">
            <Card className="p-8 bg-card hover:bg-accent/5 transition-all cursor-pointer group border-2 hover:border-primary">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Analytics</h2>
                  <p className="text-muted-foreground">Statistiken & Insights</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Sehe detaillierte Analysen deiner Artikel, Aufrufe und Follower-Entwicklung
              </p>
            </Card>
          </Link>

          <Link to="/community">
            <Card className="p-8 bg-card hover:bg-accent/5 transition-all cursor-pointer group border-2 hover:border-primary">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Community</h2>
                  <p className="text-muted-foreground">Nachrichten & Kommentare</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Verwalte private Nachrichten und öffentliche Kommentare auf deine Artikel
              </p>
            </Card>
          </Link>

          <Link to="/weird">
            <Card className="p-8 bg-card hover:bg-accent/5 transition-all cursor-pointer group border-2 hover:border-primary">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Meine Artikel</h2>
                  <p className="text-muted-foreground">Inhalte verwalten</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Erstelle, bearbeite und veröffentliche deine Artikel
              </p>
            </Card>
          </Link>

          <Link to="/weird">
            <Card className="p-8 bg-card hover:bg-accent/5 transition-all cursor-pointer group border-2 hover:border-primary">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <MessageCircle className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Profil</h2>
                  <p className="text-muted-foreground">Einstellungen & Info</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Passe dein Profil an und verwalte deine Einstellungen
              </p>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Messages;
