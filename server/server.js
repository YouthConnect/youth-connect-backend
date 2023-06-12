const express = require('express');
const router = express.Router()
//? require Auth0 functions
const { auth, requiresAuth } = require("express-openid-connect");

router.get('/hello', (req, res,next) => {
  res.status(200).send('hello');
});

// The /profile route will show the user profile as JSON
router.get('/profile', requiresAuth(), (req, res) => {
    res.send(JSON.stringify(req.oidc.user, null, 2));
});


module.exports = router;
