import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {

  // code to run on server at startup
});

 Meteor.methods({
  passCode: function (pass) {
      return pass=="caseRetreatAdmin"
  }
});
