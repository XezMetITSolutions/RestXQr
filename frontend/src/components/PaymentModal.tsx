'use client';

import { useState } from 'react';
import { 
  FaCreditCard, 
  FaMoneyBillWave, 
  FaQrcode, 
  FaTimes, 
  FaHeart,
  FaPercent,
  FaCalculator
} from 'react-icons/fa';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  language: 'tr' | 'en';
  restaurantColor: string;
  onPaymentComplete: (paymentData: any) => void;
}

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  total, 
  language, 
  restaurantColor,
  onPaymentComplete 
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | 'qr'>('card');
  const [tipAmount, setTipAmount] = useState(0);
  const [tipType, setTipType] = useState<'amount' | 'percentage'>('percentage');
  const [customTip, setCustomTip] = useState('');
  const [showTipOptions, setShowTipOptions] = useState(true);

  const texts = {
    tr: {
      payment: 'Ödeme',
      paymentMethod: 'Ödeme Yöntemi',
      card: 'Kredi/Banka Kartı',
      cash: 'Nakit',
      qr: 'QR Kod ile Ödeme',
      tip: 'Bahşiş',
      tipOptional: 'Bahşiş (isteğe bağlı)',
      noTip: 'Bahşiş Yok',
      customTip: 'Özel Tutar',
      subtotal: 'Ara Toplam',
      tipAmount: 'Bahşiş',
      total: 'Toplam',
      payNow: 'Şimdi Öde',
      thankYou: 'Teşekkürler!',
      processing: 'İşleniyor...',
      success: 'Ödeme başarılı!'
    },
    en: {
      payment: 'Payment',
      paymentMethod: 'Payment Method',
      card: 'Credit/Debit Card',
      cash: 'Cash',
      qr: 'QR Code Payment',
      tip: 'Tip',
      tipOptional: 'Tip (optional)',
      noTip: 'No Tip',
      customTip: 'Custom Amount',
      subtotal: 'Subtotal',
      tipAmount: 'Tip',
      total: 'Total',
      payNow: 'Pay Now',
      thankYou: 'Thank You!',
      processing: 'Processing...',
      success: 'Payment successful!'
    }
  };

  const t = texts[language];

  const tipPercentages = [10, 15, 20, 25];

  const calculateTip = (percentage: number) => {
    return Math.round(total * (percentage / 100));
  };

  const handleTipSelection = (percentage: number) => {
    setTipAmount(calculateTip(percentage));
    setTipType('percentage');
    setCustomTip('');
  };

  const handleCustomTip = (value: string) => {
    const amount = parseInt(value) || 0;
    setTipAmount(amount);
    setTipType('amount');
    setCustomTip(value);
  };

  const finalTotal = total + tipAmount;

  const handlePayment = () => {
    const paymentData = {
      subtotal: total,
      tip: tipAmount,
      total: finalTotal,
      method: paymentMethod,
      timestamp: new Date().toISOString()
    };

    // Simulate payment processing
    setTimeout(() => {
      onPaymentComplete(paymentData);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
      <div className="bg-white w-full max-h-[90vh] rounded-t-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">{t.payment}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 text-2xl hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[70vh]">
          {/* Payment Methods */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">{t.paymentMethod}</h3>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setPaymentMethod('card')}
                className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-colors ${
                  paymentMethod === 'card' 
                    ? 'border-current text-white' 
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
                style={paymentMethod === 'card' ? { backgroundColor: restaurantColor, borderColor: restaurantColor } : {}}
              >
                <FaCreditCard size={24} />
                <span className="text-sm font-medium">{t.card}</span>
              </button>
              
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-colors ${
                  paymentMethod === 'cash' 
                    ? 'border-current text-white' 
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
                style={paymentMethod === 'cash' ? { backgroundColor: restaurantColor, borderColor: restaurantColor } : {}}
              >
                <FaMoneyBillWave size={24} />
                <span className="text-sm font-medium">{t.cash}</span>
              </button>
              
              <button
                onClick={() => setPaymentMethod('qr')}
                className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-colors ${
                  paymentMethod === 'qr' 
                    ? 'border-current text-white' 
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
                style={paymentMethod === 'qr' ? { backgroundColor: restaurantColor, borderColor: restaurantColor } : {}}
              >
                <FaQrcode size={24} />
                <span className="text-sm font-medium">{t.qr}</span>
              </button>
            </div>
          </div>

          {/* Tip Section */}
          {showTipOptions && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <FaHeart className="text-red-500" />
                  {t.tipOptional}
                </h3>
                <button
                  onClick={() => setShowTipOptions(false)}
                  className="text-sm text-gray-500"
                >
                  {t.noTip}
                </button>
              </div>

              {/* Percentage Tips */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                {tipPercentages.map(percentage => (
                  <button
                    key={percentage}
                    onClick={() => handleTipSelection(percentage)}
                    className={`p-3 rounded-lg border-2 text-center transition-colors ${
                      tipAmount === calculateTip(percentage) && tipType === 'percentage'
                        ? 'border-current text-white'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                    style={tipAmount === calculateTip(percentage) && tipType === 'percentage' 
                      ? { backgroundColor: restaurantColor, borderColor: restaurantColor } 
                      : {}}
                  >
                    <FaPercent className="mx-auto mb-1" size={16} />
                    <div className="text-sm font-medium">{percentage}%</div>
                    <div className="text-xs">₺{calculateTip(percentage)}</div>
                  </button>
                ))}
              </div>

              {/* Custom Tip */}
              <div className="flex items-center gap-2">
                <FaCalculator className="text-gray-500" />
                <input
                  type="number"
                  placeholder={t.customTip}
                  value={customTip}
                  onChange={(e) => handleCustomTip(e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50"
                  style={{ '--tw-ring-color': restaurantColor } as any}
                />
                <span className="text-gray-500">₺</span>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">{t.subtotal}</span>
              <span className="font-medium">₺{total}</span>
            </div>
            {tipAmount > 0 && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">{t.tipAmount}</span>
                <span className="font-medium text-green-600">₺{tipAmount}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between items-center">
              <span className="text-lg font-bold">{t.total}</span>
              <span className="text-xl font-bold" style={{ color: restaurantColor }}>
                ₺{finalTotal}
              </span>
            </div>
          </div>
        </div>

        {/* Pay Button */}
        <div className="p-4 border-t">
          <button
            onClick={handlePayment}
            className="w-full py-4 rounded-lg text-white font-bold text-lg transition-opacity hover:opacity-90"
            style={{ backgroundColor: restaurantColor }}
          >
            {t.payNow} • ₺{finalTotal}
          </button>
        </div>
      </div>
    </div>
  );
}
