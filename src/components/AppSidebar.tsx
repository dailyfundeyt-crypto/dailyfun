import { Home, Bot, User, Info, MessageCircle, Globe, Search, TrendingUp, Newspaper, Users, Mail } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { language } = useLanguage();
  const { user } = useAuth();

  const mainNavigation = [
    { icon: Home, href: '/search', label: language === 'en' ? 'Home' : 'Startseite' },
    { icon: TrendingUp, href: '/products', label: language === 'en' ? 'Trending' : 'Trends' },
    { icon: Search, href: '/search', label: language === 'en' ? 'Search' : 'Suche' },
  ];

  const userNavigation = [
    { icon: User, href: '/weird', label: language === 'en' ? 'My Page' : 'Meine Seite' },
    { icon: MessageCircle, href: user ? '/messages' : '/about', label: user ? (language === 'en' ? 'Messages' : 'Nachrichten') : (language === 'en' ? 'About' : 'Über uns') },
    { icon: Users, href: '/community', label: language === 'en' ? 'Community' : 'Community' },
  ];

  const otherNavigation = [
    { icon: Newspaper, href: '/category/news', label: language === 'en' ? 'News' : 'Nachrichten' },
    { icon: Info, href: '/about', label: language === 'en' ? 'About' : 'Über uns' },
    { icon: Mail, href: '/contact', label: language === 'en' ? 'Contact' : 'Kontakt' },
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
      <SidebarContent className="bg-background">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={active}>
                      <NavLink to={item.href} className="flex items-center gap-3 px-3 py-2">
                        <Icon className="h-5 w-5" />
                        {state !== 'collapsed' && <span className="font-medium">{item.label}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          {state !== 'collapsed' && (
            <SidebarGroupLabel>
              {language === 'en' ? 'My Area' : 'Mein Bereich'}
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {userNavigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={active}>
                      <NavLink to={item.href} className="flex items-center gap-3 px-3 py-2">
                        <Icon className="h-5 w-5" />
                        {state !== 'collapsed' && <span className="font-medium">{item.label}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          {state !== 'collapsed' && (
            <SidebarGroupLabel>
              {language === 'en' ? 'Discover' : 'Entdecken'}
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {otherNavigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={active}>
                      <NavLink to={item.href} className="flex items-center gap-3 px-3 py-2">
                        <Icon className="h-5 w-5" />
                        {state !== 'collapsed' && <span className="font-medium">{item.label}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
