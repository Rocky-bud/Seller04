import { Bot } from 'lucide-react';
import ComingSoon from '../../components/ComingSoon';

export default function AdminAIUsage() {
  return (
    <ComingSoon
      icon={Bot}
      title="مصرف هوش مصنوعی"
      subtitle="گزارش تعداد مکالمات، توکن‌های مصرفی و هزینه DeepSeek"
      step="Step 2"
      accent="violet"
    />
  );
}
