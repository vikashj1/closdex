import { ReactNode } from 'react';
import { AppShell } from '@/components/shell/AppShell';

/** Layout for every route in the (app) group — wraps in the salesperson sidebar shell. */
export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
