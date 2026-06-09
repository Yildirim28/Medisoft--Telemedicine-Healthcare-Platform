import { useSearchParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';

export default function PaymentFail() {
  const [searchParams] = useSearchParams();

  return (
    <Layout>
      <div className="max-w-lg mx-auto mt-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center space-y-4">
          <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Payment Failed</h1>
          <p className="text-gray-500">
            Your payment could not be processed. Please try again.
            If the issue persists, contact our support team.
          </p>

          <div className="bg-red-50 rounded-xl p-4 border border-red-100 mt-4">
            <p className="text-sm text-red-700">
              Payment ID: <span className="font-mono font-semibold">{searchParams.get('paymentID') || searchParams.get('payment_id') || searchParams.get('tran_id') || 'N/A'}</span>
            </p>
          </div>

          <Link
            to="/payments"
            className="gradient-btn inline-flex items-center gap-2 mt-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </Link>
        </div>
      </div>
    </Layout>
  );
}
