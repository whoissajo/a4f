"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { MessageCircle, Image as ImageIcon } from 'lucide-react';

const navItems = [
  { href: '/chat', label: 'Chat with AI', icon: MessageCircle },
  { href: '/image-generator', label: 'Generate Image', icon: ImageIcon },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center space-x-2 lg:space-x-4">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary px-3 py-2 rounded-md',
            pathname === item.href ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
          )}
        >
          <item.icon className="inline-block w-4 h-4 mr-2" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
