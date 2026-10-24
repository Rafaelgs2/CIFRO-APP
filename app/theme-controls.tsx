'use client';

import { useSyncExternalStore, type ReactNode } from 'react';
import { ThemeProvider, useTheme } from 'next-themes';
import { Moon, Sun } from '@/components/icons';
import { Switch as SwitchPrimitive } from 'radix-ui';
import { Toaster } from '@/components/ui/sonner';

export function AppThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      storageKey="cifro-theme"
      defaultTheme="system"
      enableSystem
      enableColorScheme
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}

const subscribeToHydration=()=>()=>{};
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribeToHydration,()=>true,()=>false);

  return (
    <div className="theme-control">
      <label htmlFor="theme-toggle" className="theme-label">
        <Sun className="theme-sun" size={18} aria-hidden="true" />
        <Moon className="theme-moon" size={18} aria-hidden="true" />
        <span>Modo escuro</span>
      </label>
      <SwitchPrimitive.Root
        id="theme-toggle"
        className="theme-switch"
        aria-label="Modo escuro"
        title="Alternar modo claro e escuro"
        checked={mounted && resolvedTheme === 'dark'}
        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
        disabled={!mounted}
      ><SwitchPrimitive.Thumb className="theme-thumb" /></SwitchPrimitive.Root>
    </div>
  );
}

export function AppToaster() {
  const { resolvedTheme } = useTheme();
  return <Toaster position="top-center" richColors theme={resolvedTheme === 'dark' ? 'dark' : 'light'} />;
}
