import BaseModal from './BaseModal';
import { FileText } from 'lucide-react';
import { TERMS_TXT } from '../constants/terms';

export interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TermsModal({ isOpen, onClose }: TermsModalProps) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} maxWidth="3xl" closeButtonTheme="light">
      {/* Header Modal */}
      <div className="bg-gradient-to-r from-brand-primary to-brand-secondary px-8 py-6 flex items-center gap-3 flex-shrink-0">
        <FileText className="w-6 h-6 text-white" />
        <h2 className="text-white text-xl font-semibold flex-1 pr-8">{TERMS_TXT.title}</h2>
      </div>

      {/* Body Modal (Hỗ trợ cuộn tự động khi quá dài) */}
      <div className="p-8 overflow-y-auto flex-1">
        <div className="prose prose-sm max-w-none">
          {TERMS_TXT.sections.map((section, index) => (
            <div key={index} className={index > 0 ? "mt-6" : ""}>
              <h3 className="text-lg font-bold text-gray-900 mb-4">{section.title}</h3>
              {section.content && <p className="text-gray-600 mb-4">{section.content}</p>}
              
              {section.bullets && section.bullets.length > 0 && (
                <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                  {section.bullets.map((bullet, bIdx) => {
                    return <li key={bIdx}>{bullet}</li>;
                  })}
                </ul>
              )}
            </div>
          ))}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 italic">
              {TERMS_TXT.effectiveDate}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Modal */}
      <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 flex-shrink-0">
        <button
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-xl font-semibold hover:shadow-lg transition-all"
        >
          {TERMS_TXT.understandBtn}
        </button>
      </div>
    </BaseModal>
  );
}
