// pages/api/stripe.js
import Stripe from 'stripe';
import { NextApiRequest, NextApiResponse } from 'next';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2020-08-27',
});

export default async function handler(req, NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // Extract the necessary information from the request body
      const { email, paymentMethodId } = req.body;

      // Create a new customer object
      const customer = await stripe.customers.create({
        email: email,
        payment_method: paymentMethodId,
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // Create the subscription
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ plan: 'plan_id' }], // Replace 'plan_id' with your actual plan ID
        expand: ['latest_invoice.payment_intent'],
      });

      // Send back the subscription object
      res.status(200).json(subscription);
    } catch (error) {
      // Handle errors properly
      res.status(400).json({ statusCode: 400, message: error.message });
    }
  } else {
    // Handle any other HTTP methods
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
