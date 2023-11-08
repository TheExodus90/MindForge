import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

// Load your Stripe publishable key from an environment variable or your config file
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setLoading(true);
    setMessage(null);

    const cardElement = elements.getElement(CardElement);

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      console.log('[error]', error);
      setMessage(error.message);
      setLoading(false);
    } else {
      console.log('[PaymentMethod]', paymentMethod);

      try {
        const response = await fetch('/api/stripe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'customer@example.com', // Replace with email input from user
            paymentMethodId: paymentMethod.id,
          }),
        });

        if (response.ok) {
          const subscription = await response.json();
          console.log('Subscription:', subscription);
          setMessage('Payment successful! You are now subscribed.');
        } else {
          throw new Error('Network response was not ok.');
        }
      } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        setMessage('Payment failed: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe || loading}>
        {loading ? "Processing..." : "Pay"}
      </button>
      {message && <div>{message}</div>}
    </form>
  );
};

const SubscriptionPage = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
};

export default SubscriptionPage;
