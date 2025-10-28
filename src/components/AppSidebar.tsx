import { Home, MessageCircle, Globe, Eye } from 'lucide-react';
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
      className={`${state === 'collapsed' ? 'w-[72px]' : 'w-60'} transition-all duration-300 border-r border-border hidden md:block`}
      collapsible="icon"
    >
      <SidebarContent className="bg-background pt-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={active}>
                      <NavLink to={item.href} className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
                        <Icon className="h-5 w-5" />
                        {state !== 'collapsed' && <span className="font-medium">{item.label}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button 
                    onClick={toggleLanguage}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full hover:bg-accent"
                  >
                    <Globe className="h-5 w-5" />
                    {state !== 'collapsed' && (
                      <span className="font-medium">
                        {language === 'en' ? 'EN - Englisch' : 'DE - Deutsch'}
                      </span>
                    )}
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
