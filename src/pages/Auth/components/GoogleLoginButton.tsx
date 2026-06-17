import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../../providers/authProvider/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function GoogleLoginButton() {
  const [error, setError] = useState('');
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSuccess = async (credentialResponse: any) => {
    setError('');
    try {
      if (credentialResponse.credential) {
        const result = await googleLogin(credentialResponse.credential);
        const from = (location.state as any)?.from?.pathname || '/';
        navigate(from, { replace: true, state: { isFirstLogin: result.isFirstLogin } });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng nhập bằng Google thất bại');
    }
  };

  return (
    <div className="flex flex-col items-center w-full mt-4">
      <div className="relative w-full flex items-center justify-center my-4">
        <div className="absolute border-t border-gray-200 w-full" />
        <span className="bg-white px-3 text-xs text-gray-400 relative z-10">hoặc</span>
      </div>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => setError('Google Login Failed')}
        useOneTap
        shape="rectangular"
        size="large"
        width="100%"
      />
      {error && (
        <div className="mt-2 text-xs text-red-500">
          {error}
        </div>
      )}
    </div>
  );
}
