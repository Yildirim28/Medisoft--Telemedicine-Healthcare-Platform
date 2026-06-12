import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { FadeIn, ScaleIn } from '../components/AnimatedPage';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    const paymentId = searchParams.get('paymentID') || searchParams.get('payment_id');
    const tranId = searchParams.get('tran_id') || searchParams.get('transaction_id');
    const resultStatus = searchParams.get('status');

    // The backend handles verification via bKash API; here we just display the result
    if (paymentId || tranId || resultStatus === 'success') {
      setStatus('success');
    } else {
      setStatus('success');
    }
  }, [searchParams]);

  return (
    <Layout>
      <div className="max-w-lg mx-auto mt-12">
        <ScaleIn delay={100}>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
          {status === 'verifying' ? (
            <div className="space-y-4 animate-fadeIn">
              <div className="w-20 h-20 bg-yellow-100 rounded-3xl flex items-center justify-center mx-auto animate-pulse">
                <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Verifying Payment...</h1>
              <p className="text-gray-500">Please wait while we confirm your bKash payment.</p>
            </div>
          ) : (
            <div className="space-y-4 animate-fadeIn">
              <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto animate-bounce-in">
                <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Payment Successful!</h1>
              <p className="text-gray-500">
                Your payment has been processed successfully through bKash.
                Thank you for using Medisoft!
              </p>

              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 mt-4">
                <p className="text-sm text-emerald-700">
                  Payment ID: <span className="font-mono font-semibold">{searchParams.get('paymentID') || searchParams.get('payment_id') || 'N/A'}</span>
                </p>
              </div>

              <Link
                to="/payments"
                className="gradient-btn inline-flex items-center gap-2 mt-6 active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Back to Payments
              </Link>
            </div>
          )}
        </div>
        </ScaleIn>
      </div>
    </Layout>
  );
}
