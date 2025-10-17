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
} from 'lucide-react';
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from './ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useAuth, useUser } from '@/firebase';
import { Button } from './ui/button';

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const { user } = useUser();

  const handleSignOut = async () => {
    await auth.signOut();
    router.push('/login');
  };

  const menuItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/transactions', label: 'Transactions', icon: Wallet },
    { href: '/settings', label: 'Settings', icon: Settings },
    { href: '/help', label: 'Help', icon: CircleHelp },
  ];

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary">
            <Landmark className="size-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold font-headline">BudgetWise</span>
          <SidebarTrigger className="ml-auto" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label }}
                >
                  <item.icon />
                  {item.label}
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-3 p-2 rounded-lg bg-background">
          <Avatar>
            <AvatarImage src="https://picsum.photos/seed/10/40/40" data-ai-hint="person avatar" alt="User" />
            <AvatarFallback>{user?.email?.[0].toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden flex-1">
            <span className="text-sm font-medium truncate">{user?.displayName || 'User'}</span>
            <span className="text-xs text-muted-foreground truncate">
              {user?.email || 'user@example.com'}
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSignOut} className="shrink-0">
             <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </>
  );
}
