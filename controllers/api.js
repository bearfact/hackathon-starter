const util = require('util');
const request = require('request');
const cheerio = require('cheerio');
const GitHub = require('@octokit/rest');
const Twit = require('twit');
// const stripe = require('stripe')(process.env.STRIPE_SKEY);
// const twilio = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
// const clockwork = require('clockwork')({ key: process.env.CLOCKWORK_KEY });
// const paypal = require('paypal-rest-sdk');
// const lob = require('lob')(process.env.LOB_KEY);
// const ig = require('instagram-node').instagram();


/**
 * GET /api
 * List of API examples.
 */
exports.getApi = (req, res) => {
  res.render('api/index', {
    title: 'API Examples'
  });
};

/**
 * GET /api/scraping
 * Web scraping example using Cheerio library.
 */
exports.getScraping = (req, res, next) => {
  request.get('https://news.ycombinator.com/', (err, request, body) => {
    if (err) { return next(err); }
    const $ = cheerio.load(body);
    const links = [];
    $('.title a[href^="http"], a[href^="https"]').each((index, element) => {
      links.push($(element));
    });
    res.render('api/scraping', {
      title: 'Web Scraping',
      links
    });
  });
};

/**
 * GET /api/github
 * GitHub API Example.
 */
exports.getGithub = (req, res, next) => {
  const github = new GitHub();
  github.repos.get({ owner: 'sahat', repo: 'hackathon-starter' }, (err, repo) => {
    if (err) { return next(err); }
    res.render('api/github', {
      title: 'GitHub API',
      repo: repo.data
    });
  });
};

/**
 * GET /api/aviary
 * Aviary image processing example.
 */
exports.getAviary = (req, res) => {
  res.render('api/aviary', {
    title: 'Aviary API'
  });
};

/**
 * GET /api/nyt
 * New York Times API example.
 */
exports.getNewYorkTimes = (req, res, next) => {
  const query = {
    'list-name': 'young-adult',
    'api-key': process.env.NYT_KEY
  };
  request.get({ url: 'http://api.nytimes.com/svc/books/v2/lists', qs: query }, (err, request, body) => {
    if (err) { return next(err); }
    if (request.statusCode === 403) {
      return next(new Error('Invalid New York Times API Key'));
    }
    const books = JSON.parse(body).results;
    res.render('api/nyt', {
      title: 'New York Times API',
      books
    });
  });
};


/**
 * GET /api/twitter
 * Twitter API example.
 */
exports.getTwitter = (req, res, next) => {
  const token = req.user.tokens.find(token => token.kind === 'twitter');
  const T = new Twit({
    consumer_key: process.env.TWITTER_KEY,
    consumer_secret: process.env.TWITTER_SECRET,
    access_token: token.accessToken,
    access_token_secret: token.tokenSecret
  });
  T.get('search/tweets', { q: 'nodejs since:2013-01-01', geocode: '40.71448,-74.00598,5mi', count: 10 }, (err, reply) => {
    if (err) { return next(err); }
    res.render('api/twitter', {
      title: 'Twitter API',
      tweets: reply.statuses
    });
  });
};

/**
 * POST /api/twitter
 * Post a tweet.
 */
exports.postTwitter = (req, res, next) => {
  req.assert('tweet', 'Tweet cannot be empty').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/api/twitter');
  }

  const token = req.user.tokens.find(token => token.kind === 'twitter');
  const T = new Twit({
    consumer_key: process.env.TWITTER_KEY,
    consumer_secret: process.env.TWITTER_SECRET,
    access_token: token.accessToken,
    access_token_secret: token.tokenSecret
  });
  T.post('statuses/update', { status: req.body.tweet }, (err) => {
    if (err) { return next(err); }
    req.flash('success', { msg: 'Your tweet has been posted.' });
    res.redirect('/api/twitter');
  });
};


// /**
//  * GET /api/stripe
//  * Stripe API example.
//  */
// exports.getStripe = (req, res) => {
//   res.render('api/stripe', {
//     title: 'Stripe API',
//     publishableKey: process.env.STRIPE_PKEY
//   });
// };

// /**
//  * POST /api/stripe
//  * Make a payment.
//  */
// exports.postStripe = (req, res) => {
//   const { stripeToken, stripeEmail } = req.body;
//   stripe.charges.create({
//     amount: 395,
//     currency: 'usd',
//     source: stripeToken,
//     description: stripeEmail
//   }, (err) => {
//     if (err && err.type === 'StripeCardError') {
//       req.flash('errors', { msg: 'Your card has been declined.' });
//       return res.redirect('/api/stripe');
//     }
//     req.flash('success', { msg: 'Your card has been successfully charged.' });
//     res.redirect('/api/stripe');
//   });
// };

// /**
//  * GET /api/twilio
//  * Twilio API example.
//  */
// exports.getTwilio = (req, res) => {
//   res.render('api/twilio', {
//     title: 'Twilio API'
//   });
// };

// /**
//  * POST /api/twilio
//  * Send a text message using Twilio.
//  */
// exports.postTwilio = (req, res, next) => {
//   req.assert('number', 'Phone number is required.').notEmpty();
//   req.assert('message', 'Message cannot be blank.').notEmpty();

//   const errors = req.validationErrors();

//   if (errors) {
//     req.flash('errors', errors);
//     return res.redirect('/api/twilio');
//   }

//   const message = {
//     to: req.body.number,
//     from: '+13472235148',
//     body: req.body.message
//   };
//   twilio.sendMessage(message, (err, responseData) => {
//     if (err) { return next(err.message); }
//     req.flash('success', { msg: `Text sent to ${responseData.to}.` });
//     res.redirect('/api/twilio');
//   });
// };

// /**
//  * GET /api/clockwork
//  * Clockwork SMS API example.
//  */
// exports.getClockwork = (req, res) => {
//   res.render('api/clockwork', {
//     title: 'Clockwork SMS API'
//   });
// };

// /**
//  * POST /api/clockwork
//  * Send a text message using Clockwork SMS
//  */
// exports.postClockwork = (req, res, next) => {
//   const message = {
//     To: req.body.telephone,
//     From: 'Hackathon',
//     Content: 'Hello from the Hackathon Starter'
//   };
//   clockwork.sendSms(message, (err, responseData) => {
//     if (err) { return next(err.errDesc); }
//     req.flash('success', { msg: `Text sent to ${responseData.responses[0].to}` });
//     res.redirect('/api/clockwork');
//   });
// };


// /**
//  * GET /api/paypal
//  * PayPal SDK example.
//  */
// exports.getPayPal = (req, res, next) => {
//   paypal.configure({
//     mode: 'sandbox',
//     client_id: process.env.PAYPAL_ID,
//     client_secret: process.env.PAYPAL_SECRET
//   });

//   const paymentDetails = {
//     intent: 'sale',
//     payer: {
//       payment_method: 'paypal'
//     },
//     redirect_urls: {
//       return_url: process.env.PAYPAL_RETURN_URL,
//       cancel_url: process.env.PAYPAL_CANCEL_URL
//     },
//     transactions: [{
//       description: 'Hackathon Starter',
//       amount: {
//         currency: 'USD',
//         total: '1.99'
//       }
//     }]
//   };

//   paypal.payment.create(paymentDetails, (err, payment) => {
//     if (err) { return next(err); }
//     const { links, id } = payment;
//     req.session.paymentId = id;
//     for (let i = 0; i < links.length; i++) {
//       if (links[i].rel === 'approval_url') {
//         res.render('api/paypal', {
//           approvalUrl: links[i].href
//         });
//       }
//     }
//   });
// };

// /**
//  * GET /api/paypal/success
//  * PayPal SDK example.
//  */
// exports.getPayPalSuccess = (req, res) => {
//   const { paymentId } = req.session;
//   const paymentDetails = { payer_id: req.query.PayerID };
//   paypal.payment.execute(paymentId, paymentDetails, (err) => {
//     res.render('api/paypal', {
//       result: true,
//       success: !err
//     });
//   });
// };

// /**
//  * GET /api/paypal/cancel
//  * PayPal SDK example.
//  */
// exports.getPayPalCancel = (req, res) => {
//   req.session.paymentId = null;
//   res.render('api/paypal', {
//     result: true,
//     canceled: true
//   });
// };

// /**
//  * GET /api/lob
//  * Lob API example.
//  */
// exports.getLob = (req, res, next) => {
//   lob.routes.list({ zip_codes: ['10007'] }, (err, routes) => {
//     if (err) { return next(err); }
//     res.render('api/lob', {
//       title: 'Lob API',
//       routes: routes.data[0].routes
//     });
//   });
// };

/**
 * GET /api/upload
 * File Upload API example.
 */

exports.getFileUpload = (req, res) => {
  res.render('api/upload', {
    title: 'File Upload'
  });
};

exports.postFileUpload = (req, res) => {
  req.flash('success', { msg: 'File was uploaded successfully.' });
  res.redirect('/api/upload');
};


exports.getGoogleMaps = (req, res) => {
  res.render('api/google-maps', {
    title: 'Google Maps API',
    google_map_api_key: process.env.GOOGLE_MAP_API_KEY
  });
};
