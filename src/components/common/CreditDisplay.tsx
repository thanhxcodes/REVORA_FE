import { Info, Image, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface CreditBatch {
  credits: number;
  expiresDate: string;
  expiresIn?: number;
  packageName?: string;
}

interface CreditDisplayProps {
  type: 'posting' | 'featured';
  batches: CreditBatch[];
  className?: string;
}

export default function CreditDisplay({ type, batches, className = '' }: CreditDisplayProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const totalCredits = batches.reduce((sum, batch) => sum + batch.credits, 0);
  const Icon = type === 'posting' ? Image : Sparkles;
  const bgColor = type === 'posting' ? 'bg-blue-50' : 'bg-orange-50';
  const textColor = type === 'posting' ? 'text-blue-600' : 'text-orange-600';
  const borderColor = type === 'posting' ? 'border-blue-200' : 'border-orange-200';

  return (
    <div className={`relative ${className}`}>
      <div className={`flex items-center justify-between ${bgColor} ${borderColor} border-2 rounded-xl px-4 py-3`}>
        <div className="flex items-center gap-3">
          <Icon className={`w-6 h-6 ${textColor}`} />
          <div>
            <div className="text-sm text-gray-600">
              {type === 'posting' ? 'Đăng Tin' : 'Nổi Bật'}
            </div>
            <div className={`text-2xl font-bold ${textColor}`}>{totalCredits}</div>
          </div>
        </div>
        <div
          className="relative"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <Info className={`w-5 h-5 ${textColor} cursor-help`} />

          {showTooltip && batches.length > 0 && (
            <div className="absolute right-0 top-8 w-64 bg-white rounded-xl shadow-xl border-2 border-gray-200 p-4 z-50">
              <div className="text-sm font-medium text-gray-900 mb-3">Chi Tiết Credits</div>
              <div className="space-y-2">
                {batches.map((batch, index) => (
                  <div key={index} className="flex justify-between items-start text-xs border-b border-gray-100 pb-2 last:border-0">
                    <div>
                      <div className={`font-bold ${textColor}`}>{batch.credits} credits</div>
                      {batch.packageName && (
                        <div className="text-gray-500">{batch.packageName}</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-gray-600">HSD: {batch.expiresDate}</div>
                      {batch.expiresIn !== undefined && (
                        <div className="text-orange-500">Còn {batch.expiresIn} ngày</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
