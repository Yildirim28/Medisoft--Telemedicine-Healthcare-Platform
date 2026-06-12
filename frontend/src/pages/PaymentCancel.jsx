import { useSearchParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { ScaleIn } from '../components/AnimatedPage';

export default function PaymentCancel() {
  const [searchParams] = useSearchParams();

  return (
    <Layout>
      <div className="max-w-lg mx-auto mt-12">
        <ScaleIn delay={100}>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-10 text-center space-y-4 animate-fadeIn">
          <div className="w-20 h-20 bg-yellow-100 rounded-3xl flex items-center justify-center mx-auto animate-bounce-in">
            <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Payment Cancelled</h1>
          <p className="text-gray-500 dark:text-gray-400">
            You have cancelled the bKash payment process. No charges were made.
            You can initiate a new payment whenever you're ready.
          </p>

          {(searchParams.get('paymentID') || searchParams.get('tran_id')) && (
            <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-xl p-4 border border-yellow-100 dark:border-yellow-800 mt-4">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Payment ID: <span className="font-mono font-semibold">{searchParams.get('paymentID') || searchParams.get('tran_id')}</span>
              </p>
            </div>
          )}

          <Link
            to="/payments"
            className="gradient-btn inline-flex items-center gap-2 mt-6 active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Back to Payments
          </Link>
        </div>
        </ScaleIn>
      </div>
    </Layout>
  );
}
