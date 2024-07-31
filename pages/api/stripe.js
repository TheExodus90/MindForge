import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

// Replace with your Stripe publishable key
const stripePromise = loadStripe('your_publishable_key_here');

export default function Subscribe() {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (event) => {
    event.preventDefault();
    setLoading(true);

    // Create a Checkout Session on your server
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Add any necessary data for your subscription
      }),
    });

    const session = await response.json();

    // Redirect to Stripe Checkout
    const stripe = await stripePromise;
    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (result.error) {
      console.error(result.error);
    }

    setLoading(false);
  };

  return (
    <div>
      <h1>Subscribe to Our Service</h1>
      <form onSubmit={handleSubscribe}>
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Subscribe Now'}
        </button>
      </form>
    </div>
  );
}