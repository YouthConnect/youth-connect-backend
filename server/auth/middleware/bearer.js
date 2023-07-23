"use strict";

const { userModule } = require("../../models/index");

module.exports = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      _authError();
    }

    const token = req.headers.authorization.split(" ").pop();
    const validUser = await userModule.authenticateToken(token);

    req.user = validUser;
    req.token = validUser.token;
    next();
  } catch (e) {
    _authError(e);
  }

  function _authError(e) {
    //console.log(e.message);
    next("Invalid Login");
  }
};
