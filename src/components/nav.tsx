'use client';

import { LogOut } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
// import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export function Nav() {
  // const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <Sidebar
      variant="floating"
      collapsible="offcanvas"
      className="bg-background"
    >
      <SidebarHeader>
        <Link
          href="/dashboard"
          className="flex items-center justify-center py-4"
        >
          <Image
            src="/logo-white.svg"
            alt="qualifies.me"
            width={160}
            height={40}
            priority
            className="h-8 w-auto brightness-200"
          />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>{/* Add navigation items here */}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="mt-auto">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                signOut();
                redirect('/');
              }}
              className="w-full transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <LogOut />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
