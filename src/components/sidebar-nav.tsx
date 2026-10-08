'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Wallet,
  Settings,
  CircleHelp,
  Landmark,
  LogOut,
  PiggyBank,
} from 'lucide-react';
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarSeparator,
  useSidebar,
} from './ui/sidebar';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useSupabaseAuth } from '@/lib/supabase/auth-context';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user: supabaseUser, signOut: supabaseSignOut } = useSupabaseAuth();
  const { isMobile, setOpenMobile } = useSidebar();

  const displayName = supabaseUser?.name || supabaseUser?.email?.split('@')[0] || 'User';
  const displayEmail = supabaseUser?.email || 'user@example.com';

  const handleSignOut = async () => {
    await supabaseSignOut();
    router.push('/login');
  };

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const menuItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/transactions', label: 'Transactions', icon: Wallet },
    { href: '/savings', label: 'Savings', icon: PiggyBank },
    { href: '/settings', label: 'Settings', icon: Settings },
    { href: '/help', label: 'Help', icon: CircleHelp },
  ];

  return (
    <>
      <SidebarHeader className="p-4 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl neu-card-sm flex items-center justify-center text-primary shrink-0 shadow-sm">
            <Landmark className="size-5" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-lg font-extrabold tracking-tight font-headline text-foreground truncate">BudgetWise</span>
            <span className="text-[11px] text-muted-foreground font-medium -mt-0.5 truncate">Personal Finance</span>
          </div>
          <SidebarTrigger className="ml-auto" />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-2">
        <SidebarMenu className="space-y-1.5">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <SidebarMenuItem key={item.label}>
                <Link href={item.href} onClick={handleLinkClick}>
                  <SidebarMenuButton
                    isActive={isActive}
                    tooltip={{ children: item.label }}
                    className={cn(
                      "h-11 px-3.5 rounded-xl text-sm font-medium transition-all duration-150 gap-3",
                      isActive
                        ? "neu-pressed-sm text-primary font-semibold"
                        : "hover:neu-card-sm text-foreground/80 hover:text-foreground"
                    )}
                  >
                    <item.icon className={cn("size-4.5", isActive ? "text-primary" : "text-muted-foreground")} />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <div className="flex flex-col gap-2.5">
          <div className="group-data-[collapsible=icon]:hidden flex justify-around text-[11px] text-muted-foreground px-1">
            <Link href="/terms" onClick={handleLinkClick} className="hover:text-foreground transition-colors">Terms</Link>
            <span aria-hidden="true">·</span>
            <Link href="/privacy" onClick={handleLinkClick} className="hover:text-foreground transition-colors">Privacy</Link>
          </div>
          <div className="flex items-center gap-3 p-2.5 rounded-2xl neu-card-sm">
            <Avatar className="size-9 border-0 neu-pressed-sm rounded-xl">
              <AvatarFallback className="bg-transparent text-primary font-bold text-xs rounded-xl">
                {displayName[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden flex-1 min-w-0">
              <span className="text-xs font-semibold truncate text-foreground">{displayName}</span>
              <span className="text-[11px] text-muted-foreground truncate">
                {displayEmail}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="size-8 rounded-lg neu-btn shrink-0"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </>
  );
}
