import { LayoutDashboard } from 'lucide-react';
import ComingSoon from '../../components/ComingSoon';

export default function AdminOverview() {
  return (
    <ComingSoon
      icon={LayoutDashboard}
      title="مروری کلی سیستم"
      subtitle="آمار جهانی تمام فروشگاه‌ها، سفارشات، و درآمد کل"
      step="Step 2"
      accent="violet"
    />
  );
}
