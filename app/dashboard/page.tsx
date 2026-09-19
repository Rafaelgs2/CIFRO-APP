import FinanceApp from '../finance-main';
import {AuthGate} from './auth-gate';

export default function DashboardPage() {
  return <AuthGate><FinanceApp /></AuthGate>;
}
