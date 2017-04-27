import {
    Template
}
from 'meteor/templating';
import {
    ReactiveVar
}
from 'meteor/reactive-var';
import {
    Questions
}
from '../../lib/questions.js';

import './body.html';

import {
    Meteor
}
from 'meteor/meteor';

/*
$(function() {
    $.getJSON("https://api.ipify.org?format=jsonp&callback=?",
        function(json) {
            Session.set()
            console.log("My public IP address is: ", json.ip);
        }
    );
});
*/

Template.newQuestion.onCreated(function helloOnCreated() {
    // counter starts at 0
    this.counter = new ReactiveVar(0);
    this.authorized = new ReactiveVar(false);
    var self = this;
    let adminCookie = Cookie.get("caseAdmin");
    if (adminCookie) {
        Meteor.apply("passCode", [adminCookie], function(error, result) {
            self.authorized.set(result);
        });
    }
});

Template.newQuestion.helpers({
    'admin' () {
        return Template.instance().authorized.get();
    },
    'superadmin' () {
        return false;
    }
});

Template.newQuestion.events({
    'submit .new-question' (event) {
        // Prevent default browser form submit
        event.preventDefault();

        // Get value from form element
        const target = event.target;
        const text = target.text.value;

        // Insert a task into the collection
        if (text.length>0){
            Questions.insert({
            text: text,
            createdAt: new Date(), // current time
            votesUp: 0,
            votesDown: 0,
            modifiedAt: new Date(),
            comments: []
        });
        }

        // Clear form
        target.text.value = '';
    },
        'click #borrar' () {
            event.preventDefault();
            let a = Questions.find().fetch();
            a.forEach(function f(elem) {
                Questions.remove(elem._id);
            });
    },
});

Template.listOfQuestions.onCreated(function() {
    this.sortCriteria = new ReactiveVar("VotesDown");
});

Template.listOfQuestions.helpers({
    questions() {
        let criteria = Template.instance().sortCriteria.get();
        let sorter = null;
        if (criteria == "VotesDown") {
            sorter = {
                sort: {
                    votesUp: -1
                }
            }
        } else if (criteria == "VotesUp") {
            sorter = {
                sort: {
                    votesUp: 1
                }
            }
        } else if (criteria == "DateDown") {
            sorter = {
                sort: {
                    createdAt: -1
                }
            }
        } else if (criteria == "DateUp") {
            sorter = {
                sort: {
                    createdAt: 1
                }
            }
        };
        return Questions.find({}, sorter);
    },
    voteSortCriteria() {
        let curCriteria = Template.instance().sortCriteria.get();
        let txt = "";
        if (curCriteria == "VotesDown") {
            txt = 'glyphicon glyphicon-triangle-bottom'
        } else if (curCriteria == "VotesUp") {
            txt = 'glyphicon glyphicon-triangle-top'
        }
        return txt;

    },
    dateSortCriteria() {
        let curCriteria = Template.instance().sortCriteria.get();
        let txt = "";
        if (curCriteria == "DateDown") {
            txt = 'glyphicon glyphicon-triangle-bottom'
        } else if (curCriteria == "DateUp") {
            txt = 'glyphicon glyphicon-triangle-top'
        }
        return txt;

    }
});


Template.listOfQuestions.events({
    'click .toggleAllComments' (event) {
        event.preventDefault();
        let currentText = event.target.innerHTML;
        if (currentText == "Show all comments") {
            event.target.innerHTML = "Hide all comments";
            $('.comments').each(function() {
                $(this).collapse('show')
            });
            $('.toggleComment').each(function() {
                this.innerHTML = "Hide comments"
            });
        } else {
            event.target.innerHTML = "Show all comments";
            $('.comments').each(function() {
                $(this).collapse('hide')
            });
            $('.toggleComment').each(function() {
                this.innerHTML = "Show / Add comments"
            });

        }
    },
        'click .toggleComment' (event) {
            event.preventDefault();
            let currentText = event.target.innerHTML;
            if (currentText == "Show / Add comments") {
                event.target.innerHTML = "Hide comments";
                $('#comments_' + this._id).collapse('toggle');
            } else {
                event.target.innerHTML = "Show / Add comments";
                $('#comments_' + this._id).collapse('toggle');
            }
    },
        'click .sortVotes' (event) {
            event.preventDefault();
            let curCriteria = Template.instance().sortCriteria.get();
            if (curCriteria == "VotesUp") {
                Template.instance().sortCriteria.set("VotesDown");
            } else {
                Template.instance().sortCriteria.set("VotesUp");
            }
    },
        'click .sortDate' (event) {
            event.preventDefault();
            let curCriteria = Template.instance().sortCriteria.get();
            if (curCriteria == "DateUp") {
                Template.instance().sortCriteria.set("DateDown");
            } else {
                Template.instance().sortCriteria.set("DateUp");
            }
    }
});

Template.question.onCreated(function helloOnCreated() {
    // counter starts at 0
    this.authorized = new ReactiveVar(false);
    var self = this;
    let adminCookie = Cookie.get("caseAdmin");
    if (adminCookie) {
        Meteor.apply("passCode", [adminCookie], function(error, result) {
            self.authorized.set(result);
        });
    }
});


Template.question.helpers({
    diff() {
        return this.votesUp - this.votesDown;
    },
    comments() {
        let parentID = this._id;
        return _.map(this.comments, function(d) {
            let newd = d;
            newd.parentID = parentID;
            return newd;
        });
    },
    posORneg() {
        let state = "";
        if ((this.votesUp - this.votesDown) > 0) {
            state = "positive"
        } else if ((this.votesUp - this.votesDown) < 0) {
            state = "negative"
        }
        return state;
    },
    alreadyUp() {
        let cookie = Cookie.get("caseRetreatVote");
        return (cookie && cookie.indexOf(this._id + "_vote_+") >= 0) ? "alreadyUp" : "soft";
    },
    alreadyDown() {
        let cookie = Cookie.get("caseRetreatVote");
        return (cookie && cookie.indexOf(this._id + "_vote_-") >= 0) ? "alreadyDown" : "soft";
    },
    questionID() {
        return this._id;
    },
    formatDate(date) {
        let timestamp = new Date(date);
        var curr_date = timestamp.getDate();
        var curr_month = timestamp.getMonth();
        curr_month++;
        var curr_year = timestamp.getFullYear();
        var curr_hour = timestamp.getHours();
        var curr_minute = timestamp.getMinutes();
        var curr_second = timestamp.getSeconds();
        result = curr_date + "/" + curr_month + "/" + curr_year + " " + curr_hour + ":" + curr_minute + ":" + curr_second;
        return result;
    },
        'admin' () {
        return Template.instance().authorized.get();
    }
});

Template.question.events({
    'click .borrarQuestion' (event){
        event.preventDefault();
        Questions.remove(this._id);
    },
    'click .voteUp' (event) {
        // Prevent default browser form submit
        event.preventDefault();
        // Check if previously voted
        let cookie = Cookie.get("caseRetreatVote");
        if (!cookie || cookie.indexOf(this._id + "_vote_") < 0) {
            Questions.update({
                _id: this._id
            }, {
                $set: {
                    votesUp: this.votesUp + 1
                }
            });
            // Insert id into cookie
            let newCookie = this._id + "_vote_+";
            if (cookie) {
                newCookie = newCookie + " " + cookie;
            }
            Cookie.set("caseRetreatVote", newCookie);
        } else {

            Questions.update({
                _id: this._id
            }, {
                $set: {
                    votesUp: this.votesUp - 1
                }
            });
            // Remove id from the cookie
            let newCookie = cookie.replace(this._id + "_vote_+", "");
            Cookie.set("caseRetreatVote", newCookie);
        }
    },
        'click .voteDown' (event) {
            // Prevent default browser form submit
            event.preventDefault();
            let cookie = Cookie.get("caseRetreatVote");
            if (true || !cookie || cookie.indexOf(this._id) < 0) {
                Questions.update({
                    _id: this._id
                }, {
                    $set: {
                        votesDown: this.votesDown + 1
                    }
                });
                let newCookie = this._id + "-";
                if (cookie) {
                    newCookie = newCookie + " " + cookie;
                }
                Cookie.set("caseRetreatVote", newCookie);
            } else {
                console.log("Sorry, only one vote per person per question");
            }
    },
        'submit .new-comment' (event) {
            // Prevent default browser form submit
            event.preventDefault();

            // Get value from form element
            const target = event.target;
            const text = target.text.value;
            let comments = this.comments;
            comments.push({
                text: text,
                votes: 0,
                idx: comments.length
            });
            // Insert comment in collection
            Questions.update({
                _id: this._id
            }, {
                $set: {
                    comments: comments,
                    modifiedAt: new Date()
                }
            });
            // Clear form
            target.text.value = '';
    },
});

Template.comment.onCreated(function helloOnCreated() {
    // counter starts at 0
    this.authorized = new ReactiveVar(false);
    var self = this;
    let adminCookie = Cookie.get("caseAdmin");
    if (adminCookie) {
        Meteor.apply("passCode", [adminCookie], function(error, result) {
            self.authorized.set(result);
        });
    }
});

Template.comment.helpers({
    commentVoted() {
        let cookie = Cookie.get("caseRetreatVote");
        return (cookie && cookie.indexOf(this.parentID + "_comment_" + (this.idx) + "+") >= 0) ? "alreadyUp" : "soft";
    },
    'click .borrarComment' (event){
        event.preventDefault();
        let question = Questions.findOne(this.parentID);
        let comments = question.comments;
        let newComments = [];
        comments.forEach(function(d,i){
           if (d.idx != this.idx) {
               newComments.append({
                   text: d.text,
                    votes: d.votes,
                    idx: i});
           }
        });
        Questions.update({
                _id: question._id
            }, {
                $set: {
                    comments: newComments
                }
            });

    },
    'admin' () {
        return Template.instance().authorized.get();
    }
});

Template.comment.events({

    'click .commentVoting' (event) {
        // Prevent default browser form submit
        event.preventDefault();
        // Check if previously voted
        let question = Questions.findOne(this.parentID);
        let comments = question.comments;
        let cookie = Cookie.get("caseRetreatVote");
        let cookieTxt = this.parentID + "_comment_" + (this.idx);
        if (!cookie || cookie.indexOf(cookieTxt) < 0) {
            comments[this.idx].votes = comments[this.idx].votes + 1;
            Questions.update({
                _id: question._id
            }, {
                $set: {
                    comments: comments
                }
            });
            // Insert id into cookie
            let newCookie = cookieTxt + "+";
            if (cookie) {
                newCookie = newCookie + " " + cookie;
            }
            Cookie.set("caseRetreatVote", newCookie);
        } else {
            comments[this.idx].votes = comments[this.idx].votes - 1;
            Questions.update({
                _id: question._id
            }, {
                $set: {
                    comments: comments
                }
            });
            // Remove id from the cookie
            let newCookie = cookie.replace(cookieTxt + "+", "");
            Cookie.set("caseRetreatVote", newCookie);
        }
    }
});
