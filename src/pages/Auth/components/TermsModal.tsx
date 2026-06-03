import BaseModal from './BaseModal';
import { FileText, Mail, Phone, MapPin } from 'lucide-react';
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
                <div className="space-y-3 mb-4">
                  {section.bullets.map((bullet, bIdx) => {
                    const isEmail = bullet.includes('Email:');
                    const isHotline = bullet.includes('Hotline:');
                    const isAddress = bullet.includes('Địa chỉ:');
                    
                    if (isEmail || isHotline || isAddress) {
                      let Icon = Mail;
                      const cleanBullet = bullet.replace(/[📧📞🏢]/g, '').trim();
                      const colonIdx = cleanBullet.indexOf(':');
                      let label = '';
                      let val = '';
                      if (colonIdx > 0) {
                        label = cleanBullet.substring(0, colonIdx + 1);
                        val = cleanBullet.substring(colonIdx + 1).trim();
                      }
                      
                      if (isEmail) Icon = Mail;
                      if (isHotline) Icon = Phone;
                      if (isAddress) Icon = MapPin;
                      
                      return (
                        <div key={bIdx} className="flex items-center gap-3 text-gray-600 mt-2 pl-1">
                          <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary flex-shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="text-sm">
                            <strong className="text-gray-900 font-semibold">{label} </strong>
                            <span className="text-gray-600">{val}</span>
                          </div>
                        </div>
                      );
                    }
                    
                    return (
                      <div key={bIdx} className="flex items-start gap-2 text-gray-600 pl-1">
                        <span className="text-brand-primary mt-1.5 flex-shrink-0 text-[10px]">•</span>
                        <span className="text-sm">{bullet}</span>
                      </div>
                    );
                  })}
                </div>
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
