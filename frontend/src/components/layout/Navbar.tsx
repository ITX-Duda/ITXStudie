'use client';
import Link from 'next/link';
import { Activity, Folder, BookOpen, Layers } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const user = useUserStore(state => state.user);
  const pathname = usePathname();

  const navLink = (href: string, label: string, Icon: React.ElementType) => {
    const active = pathname === href || pathname.startsWith(href + '/');
    return (
      <Link
        href={href}
        className={`text-sm font-medium flex items-center gap-1.5 transition-colors ${
          active ? 'text-emerald-400' : 'text-slate-400 hover:text-emerald-400'
        }`}
      >
        <Icon className="w-4 h-4" />
        {label}
      </Link>
    );
  };

  return (
    <nav className="border-b border-emerald-900/30 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors">
          <Activity className="w-6 h-6" />
          <h1 className="text-xl font-bold tracking-wider">ITXStudie</h1>
        </Link>
        <div className="flex items-center gap-6">
          {navLink('/circles', 'Circles', Layers)}
          {navLink('/categories', 'Categories', Folder)}
          {navLink('/topics', 'Topics', BookOpen)}
          <div className="h-8 w-8 rounded-full bg-emerald-900 flex items-center justify-center text-sm font-medium border border-emerald-500/30" title={user?.name}>
            {user?.name?.substring(0, 2).toUpperCase() || 'DU'}
          </div>
        </div>
      </div>
    </nav>
  );
}
