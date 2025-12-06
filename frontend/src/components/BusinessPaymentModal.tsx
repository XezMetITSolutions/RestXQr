'use client';

import { useState } from 'react';
import { 
  FaCreditCard, 
  FaMoneyBillWave, 
  FaQrcode, 
  FaTimes, 
  FaCheck,
  FaShieldAlt,
  FaLock
} from 'react-icons/fa';

interface BusinessPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  planName: string;
  billingCycle: string;
  onPaymentComplete: (paymentData: any) => void;
}

export default function BusinessPaymentModal({ 
  isOpen, 
  onClose, 
  total, 
  planName,
  billingCycle,
  onPaymentComplete 
}: BusinessPaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank' | 'qr'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const paymentMethods = [
    {
      id: 'card',
      name: 'Kredi/Banka Kartı',
      description: 'Visa, Mastercard, American Express'
    },
    {
      id: 'bank',
      name: 'Banka Havalesi',
      description: 'EFT, Havale ile ödeme'
    },
    {
      id: 'qr',
      name: 'QR Kod ile Ödeme',
      description: 'Mobil ödeme uygulamaları'
    }
  ];

  const handlePayment = () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsCompleted(true);
      
      // Show success for 2 seconds then close
      setTimeout(() => {
        onPaymentComplete({
          plan: planName,
          billingCycle,
          total,
          method: paymentMethod,
          timestamp: new Date().toISOString()
        });
        onClose();
        setIsCompleted(false);
      }, 2000);
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Ödeme</h2>
              <p className="text-orange-100 text-sm mt-1">Güvenli ödeme işlemi</p>
            </div>
            <button
              onClick={onClose}
              className="text-orange-200 hover:text-white text-2xl transition-colors"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Plan Bilgisi */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-800">{planName}</h3>
              <span className="text-sm text-gray-600">{billingCycle}</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">₺{total.toLocaleString()}</div>
            <div className="text-sm text-gray-500 mt-1">
              {billingCycle === 'monthly' ? 'Aylık' : 
               billingCycle === 'sixMonths' ? '6 Aylık' : 'Yıllık'} ödeme
            </div>
          </div>

          {/* Ödeme Yöntemleri */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">Ödeme Yöntemi</h3>
            <div className="space-y-3">
              {paymentMethods.map((method) => {
                const getIcon = (id: string) => {
                  switch(id) {
                    case 'card': return <FaCreditCard size={20} />;
                    case 'bank': return <FaMoneyBillWave size={20} />;
                    case 'qr': return <FaQrcode size={20} />;
                    default: return <FaCreditCard size={20} />;
                  }
                };
                
                return (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id as any)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      paymentMethod === method.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        paymentMethod === method.id 
                          ? 'bg-orange-500 text-white' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {getIcon(method.id)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{method.name}</div>
                        <div className="text-sm text-gray-600">{method.description}</div>
                      </div>
                      {paymentMethod === method.id && (
                        <FaCheck className="ml-auto text-orange-500" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Güvenlik Bilgisi */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <FaShieldAlt className="text-blue-600" />
              <span className="font-medium text-blue-800">Güvenli Ödeme</span>
            </div>
            <div className="text-sm text-blue-700">
              <div className="flex items-center gap-2 mb-1">
                <FaLock className="text-xs" />
                <span>256-bit SSL şifreleme</span>
              </div>
              <div className="flex items-center gap-2">
                <FaShieldAlt className="text-xs" />
                <span>PCI DSS uyumlu</span>
              </div>
            </div>
          </div>

          {/* Ödeme Butonu */}
          <button
            onClick={handlePayment}
            disabled={isProcessing || isCompleted}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              isProcessing || isCompleted
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white'
            }`}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>İşleniyor...</span>
              </div>
            ) : isCompleted ? (
              <div className="flex items-center justify-center gap-2">
                <FaCheck />
                <span>Ödeme Başarılı!</span>
              </div>
            ) : (
              `Ödeme Yap • ₺${total.toLocaleString()}`
            )}
          </button>

          {/* Ödeme Bilgisi */}
          <div className="text-center mt-4">
            <p className="text-xs text-gray-500">
              Ödeme işlemi tamamlandıktan sonra planınız otomatik olarak aktifleştirilecektir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
