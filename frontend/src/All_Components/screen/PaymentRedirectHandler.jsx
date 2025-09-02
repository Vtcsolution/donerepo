import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function PaymentRedirectHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const paymentId = searchParams.get('id');
    console.log('PaymentRedirectHandler: paymentId=', paymentId); // Debug log
    if (paymentId) {
      localStorage.setItem('lastPaymentId', paymentId);
      navigate(`/payment/result?id=${paymentId}`);
    } else {
      console.warn('PaymentRedirectHandler: No paymentId found in search params');
      navigate('/payment/result');
    }
  }, [searchParams, navigate]);

  return null;
}