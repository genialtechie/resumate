'use client';

import { LogOut, X } from 'lucide-react';
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
import { useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

export function Nav() {
  // const pathname = usePathname();
  const { signOut, user } = useAuth();
  const { toggleSidebar } = useSidebar();

  // Debug user info
  useEffect(() => {
    console.log('User in sidebar:', user);
  }, [user]);

  return (
    <Sidebar
      variant="floating"
      collapsible="offcanvas"
      className="bg-background"
    >
      <SidebarHeader className="relative">
        {/* Close button - visible on both mobile and desktop */}
        <Button
          onClick={toggleSidebar}
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-7 w-7 hover:bg-slate-800"
          aria-label="Close sidebar"
        >
          <X className="h-4 w-4" />
        </Button>

        <Link
          href="/dashboard"
          className="flex items-center justify-center pt-8 pb-4"
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
              className="w-full transition-colors bg-slate-800/50 hover:bg-primary hover:text-primary-foreground"
            >
              <LogOut className="text-primary" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
