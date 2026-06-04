import BaseModal from './BaseModal';
import { Shield, Mail, Phone, MapPin } from 'lucide-react';
import { PRIVACY_TXT } from '../constants/privacy';

export interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} maxWidth="3xl" closeButtonTheme="light">
      {/* Header Modal */}
      <div className="bg-gradient-to-r from-brand-primary to-brand-secondary px-8 py-6 flex items-center gap-3 flex-shrink-0">
        <Shield className="w-6 h-6 text-white" />
        <h2 className="text-white text-xl font-semibold flex-1 pr-8">{PRIVACY_TXT.title}</h2>
      </div>

      {/* Body Modal */}
      <div className="p-8 overflow-y-auto flex-1">
        <div className="prose prose-sm max-w-none">
          {PRIVACY_TXT.sections.map((section, index) => (
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
                    
                    const colonIdx = bullet.indexOf(':');
                    if (colonIdx > 0 && colonIdx < 30) {
                      const prefix = bullet.substring(0, colonIdx + 1);
                      const suffix = bullet.substring(colonIdx + 1);
                      return (
                        <div key={bIdx} className="flex items-start gap-2 text-gray-600 pl-1">
                          <span className="text-brand-primary mt-1.5 flex-shrink-0 text-[10px]">•</span>
                          <span className="text-sm">
                            <strong className="text-gray-900 font-semibold">{prefix}</strong>{suffix}
                          </span>
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

              {section.paragraphs && section.paragraphs.length > 0 && (
                section.paragraphs.map((p, pIdx) => {
                  if (p === PRIVACY_TXT.notSellText) {
                    return (
                      <p key={pIdx} className="text-gray-600 mb-4">
                        {PRIVACY_TXT.notSellPrefix}<strong>{PRIVACY_TXT.notSellHighlight}</strong>{PRIVACY_TXT.notSellSuffix}
                      </p>
                    );
                  }
                  return <p key={pIdx} className="text-gray-600 mb-4">{p}</p>;
                })
              )}
            </div>
          ))}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 italic">
              {PRIVACY_TXT.effectiveDate}
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
          {PRIVACY_TXT.understandBtn}
        </button>
      </div>
    </BaseModal>
  );
}
