'use client';

import { LogOut } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
// import { usePathname } from 'next/navigation';
// import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { redirect } from 'next/navigation';

export function Nav() {
  // const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <Sidebar
      variant="floating"
      collapsible="offcanvas"
      className="bg-background"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => {
                    signOut();
                    redirect('/');
                  }}
                >
                  <LogOut />
                  <span>Sign Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
