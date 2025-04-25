require('dotenv').config();
console.log('Stripe secret:', process.env.STRIPE_SECRET_KEY ? 'OK' : 'NOPE');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = stripe;
