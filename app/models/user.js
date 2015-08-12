var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

// set up a mongoose model
var todoSchema = mongoose.Schema({
  text: String,
  date: Number,
  done: Boolean
});

var userSchema = mongoose.Schema({

  local: {
    email: String,
    password: String,
  },
  daily: [todoSchema],
  weekly: [todoSchema],
  monthly: [todoSchema]
});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);