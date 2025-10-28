import { Home, MessageCircle, Globe, Eye, Bot } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { language, toggleLanguage } = useLanguage();
  const { user } = useAuth();

  const navigation = [
    { icon: Home, href: '/search', label: language === 'en' ? 'Home' : 'Startseite' },
    { icon: Bot, href: '/ai', label: language === 'en' ? 'AI Chat' : 'AI Chat' },
    { icon: MessageCircle, href: user ? '/messages' : '/auth', label: language === 'en' ? 'Messages' : 'Nachrichten' },
    { icon: Eye, href: '/weird', label: language === 'en' ? 'Preview' : 'Vorschau' },
  ];

  const isActive = (href: string) => {
    if (href === '/search') {
      return location.pathname === '/' || location.pathname === '/search';
    }
    return location.pathname === href;
  };

  return (
    <Sidebar
      className={`${state === 'collapsed' ? 'w-[72px]' : 'w-64'} transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] border-r border-border/50 hidden md:block backdrop-blur-xl`}
      collapsible="icon"
    >
      <SidebarContent className="bg-background/80 backdrop-blur-2xl pt-6 px-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <NavLink 
                      to={item.href}
                      className={`
                        flex items-center gap-3.5 px-4 py-3 rounded-[14px] 
                        transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
                        ${active 
                          ? 'bg-primary/10 text-primary shadow-lg shadow-primary/20 scale-[1.02]' 
                          : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground hover:scale-[1.01]'
                        }
                        active:scale-[0.98]
                      `}
                    >
                      <Icon className={`h-5 w-5 transition-all duration-300 ${active ? 'scale-110' : ''}`} />
                      {state !== 'collapsed' && (
                        <span className="font-medium tracking-tight">{item.label}</span>
                      )}
                    </NavLink>
                  </SidebarMenuItem>
                );
              })}
              
              <SidebarMenuItem>
                <button 
                  onClick={toggleLanguage}
                  className="
                    flex items-center gap-3.5 px-4 py-3 rounded-[14px] w-full
                    text-muted-foreground transition-all duration-300 
                    ease-[cubic-bezier(0.32,0.72,0,1)]
                    hover:bg-accent/50 hover:text-foreground hover:scale-[1.01]
                    active:scale-[0.98]
                  "
                >
                  <Globe className="h-5 w-5" />
                  {state !== 'collapsed' && (
                    <span className="font-medium tracking-tight">
                      {language === 'en' ? 'EN - English' : 'DE - Deutsch'}
                    </span>
                  )}
                </button>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
