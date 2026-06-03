import BaseModal from './BaseModal';
import { CheckCircle } from 'lucide-react';
import { REGISTER_SUCCESS_TXT } from '../constants/registerSuccess';

export interface RegisterSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  name: string;
}

export default function RegisterSuccessModal({ isOpen, onClose, name }: RegisterSuccessModalProps) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} maxWidth="sm" closeButtonTheme="dark">
      {/* Thanh viền màu gradient trên cùng */}
      <div className="h-1.5 bg-gradient-to-r from-brand-primary via-brand-accent to-brand-secondary" />

      {/* Nội dung Modal */}
      <div className="p-8 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-brand-primary/10 to-brand-accent/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-10 h-10 text-brand-primary" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{REGISTER_SUCCESS_TXT.title}</h3>
        <p className="text-gray-500 text-sm mb-1">{REGISTER_SUCCESS_TXT.welcome}</p>
        <p className="text-brand-primary font-semibold mb-6">{`${name} 🎉`}</p>
        <p className="text-xs text-gray-400 mb-6 leading-relaxed">
          {REGISTER_SUCCESS_TXT.desc}
        </p>
        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary text-white py-3 rounded-2xl hover:shadow-lg hover:shadow-brand-primary/25 transition-all font-semibold"
        >
          {REGISTER_SUCCESS_TXT.loginBtn}
        </button>
      </div>
    </BaseModal>
  );
}
