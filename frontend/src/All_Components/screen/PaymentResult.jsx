import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useAuth } from './AuthContext';

export default function PaymentResult() {
  const [status, setStatus] = useState('loading');
  const [paymentData, setPaymentData] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const checkPaymentStatus = async (attempt = 1, maxAttempts = 3) => {
      try {
        const paymentId = searchParams.get('id') || localStorage.getItem('lastPaymentId');
        console.log('PaymentResult: Checking payment status', { paymentId, attempt });

        if (!paymentId) {
          throw new Error('Payment reference not found');
        }

        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/payments/status/${paymentId}`,
          { withCredentials: true }
        );

        console.log('PaymentResult: Status response', response.data);

        if (response.data.status === 'pending' && attempt < maxAttempts) {
          console.log('PaymentResult: Payment still pending, retrying...', { attempt });
          setTimeout(() => checkPaymentStatus(attempt + 1, maxAttempts), 2000);
          return;
        }

        setPaymentData(response.data);
        setStatus(response.data.status === 'paid' ? 'success' : 'failed');
        
      } catch (error) {
        console.error('Payment verification failed:', {
          error: error.message,
          response: error.response?.data
        });
        setStatus('failed');
        setPaymentData({
          error: error.response?.data?.error || error.message
        });
      } finally {
        if (status === 'success') {
          localStorage.removeItem('lastPaymentId');
        }
      }
    };

    checkPaymentStatus();
  }, [searchParams, status]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        <p className="text-lg">Verifying payment...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-6">
      {status === 'success' ? (
        <>
          <CheckCircle2 className="h-16 w-16 text-green-500" />
          <h1 className="text-2xl font-bold">Payment Successful!</h1>
          {paymentData && (
            <div className="text-center">
              <p>Amount: €{paymentData.amount?.toFixed(2)}</p>
              <p>Credits Added: {paymentData.creditsAdded}</p>
            </div>
          )}
        </>
      ) : (
        <>
         <div>
          </div>
          </>
      )}
      
      <button
        onClick={() => navigate('/')}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Return to Home
      </button>
    </div>
  );
}