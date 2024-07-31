import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Success() {
  const router = useRouter();
  const { session_id } = router.query;
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (session_id) {
      // Here you could call your API to confirm the subscription
      // For now, we'll just simulate a successful confirmation
      setTimeout(() => {
        setStatus('success');
      }, 1000);
    }
  }, [session_id]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Subscription Successful!</h1>
      <p>Thank you for subscribing to our service.</p>
    </div>
  );
}