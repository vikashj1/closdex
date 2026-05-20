import { ReactNode } from 'react';
import { CompanyShell } from '@/components/shell/CompanyShell';

/** Layout for /company/* — wraps in the company-side sidebar shell. */
export default function CompanyLayout({ children }: { children: ReactNode }) {
  return <CompanyShell>{children}</CompanyShell>;
}
