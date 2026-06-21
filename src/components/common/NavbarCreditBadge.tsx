import { Image, Sparkles, X } from 'lucide-react';
import { useState } from 'react';

interface CreditBatch {
  credits: number;
  expiresDate: string;
  expiresIn?: number;
  packageName?: string;
}

interface NavbarCreditBadgeProps {
  type: 'posting' | 'featured';
  batches: CreditBatch[];
}

export default function NavbarCreditBadge({ type, batches }: NavbarCreditBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const totalCredits = batches.reduce((sum, batch) => sum + batch.credits, 0);
  const Icon = type === 'posting' ? Image : Sparkles;
  const bgColor = type === 'posting' ? 'bg-blue-500/20' : 'bg-orange-500/20';
  const textColor = type === 'posting' ? 'text-blue-200' : 'text-orange-200';
  const iconColor = type === 'posting' ? 'text-blue-300' : 'text-orange-300';

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowTooltip(!showTooltip);
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className={`flex items-center space-x-2 ${bgColor} backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20 cursor-pointer select-none`}
      >
        <Icon className={`w-4 h-4 ${iconColor}`} />
        <span className={`font-semibold text-sm ${textColor}`}>{totalCredits}</span>
      </button>

      {showTooltip && batches.length > 0 && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowTooltip(false)} />
          <div className="absolute right-0 top-12 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-50">
            <div className="text-sm font-semibold text-gray-900 mb-3 flex items-center justify-between">
              <div>
                <span>{type === 'posting' ? 'Đăng Tin' : 'Nổi Bật'}</span>
                <span className={`ml-2 ${type === 'posting' ? 'text-blue-600' : 'text-orange-600'}`}>{totalCredits} credits</span>
              </div>
              <button onClick={(e) => { e.stopPropagation(); setShowTooltip(false); }} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {batches.map((batch, index) => (
                <div key={index} className="flex justify-between items-start text-xs bg-gray-50 rounded-lg p-3 border-b border-gray-100 last:border-0">
                  <div>
                    <div className={`font-bold text-sm ${type === 'posting' ? 'text-blue-600' : 'text-orange-600'}`}>{batch.credits} credits</div>
                    {batch.packageName && (
                      <div className="text-gray-500 mt-0.5">{batch.packageName}</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-gray-600">HSD: {batch.expiresDate}</div>
                    {batch.expiresIn !== undefined && (
                      <div className={`mt-0.5 ${batch.expiresIn <= 3 ? 'text-red-500' : 'text-orange-500'}`}>
                        Còn {batch.expiresIn} ngày
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
