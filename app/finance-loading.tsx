import {Skeleton} from '@/components/ui/skeleton';

export function FinanceLoading() {
  return <div className="finance-loading" role="status" aria-label="Carregando seus dados"><span className="sr-only">Carregando seus dados…</span><Skeleton className="skeleton-heading"/><Skeleton className="skeleton-caption"/><div className="skeleton-balance"><Skeleton/><Skeleton/></div><Skeleton className="skeleton-chart"/></div>;
}
