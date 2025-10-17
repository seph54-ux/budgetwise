'use client';

import {
  LayoutDashboard,
  Wallet,
  Settings,
  CircleHelp,
  Landmark,
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

export function SidebarNav() {
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
          <SidebarMenuItem>
            <SidebarMenuButton
              href="#"
              isActive
              tooltip={{ children: 'Dashboard' }}
            >
              <LayoutDashboard />
              Dashboard
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton href="#" tooltip={{ children: 'Transactions' }}>
              <Wallet />
              Transactions
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton href="#" tooltip={{ children: 'Settings' }}>
              <Settings />
              Settings
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton href="#" tooltip={{ children: 'Help' }}>
              <CircleHelp />
              Help
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="flex items-center gap-3 p-2 rounded-lg bg-background">
          <Avatar>
            <AvatarImage src="https://picsum.photos/seed/10/40/40" data-ai-hint="person avatar" alt="User" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium truncate">User</span>
            <span className="text-xs text-muted-foreground truncate">
              user@example.com
            </span>
          </div>
        </div>
      </SidebarFooter>
    </>
  );
}
