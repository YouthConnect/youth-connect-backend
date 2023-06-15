"use strict";

const base64 = require("base-64");
const { userModule } = require("../../models/index");

module.exports = async (req, res, next) => {
  if (!req.headers.authorization) {
    return _authError();
  }
  console.log('BASIC AUTH: ', req.headers.authorization, userModule)

  try {

    let basic = req.headers.authorization.split(" ").pop();
    let [user, pass] = base64.decode(basic).split(":");

    console.log(user, pass)
    req.user = await userModule.authenticateBasic(user, pass);
    console.log('WORKING')
    next();
  } catch (e) {
    _authError();
  }

  function _authError() {
    res.status(403).send("Invalid Login");
  }
};
