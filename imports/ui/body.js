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

Template.newQuestion.onCreated(function helloOnCreated() {
    // counter starts at 0
    this.counter = new ReactiveVar(0);
});

Template.newQuestion.helpers({
    debugMode() {
        return true;
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
        Questions.insert({
            text: text,
            createdAt: new Date(), // current time
            votesUp: 0,
            votesDown: 0,
            modifiedAt: new Date(),
            comments: []
        });

        // Clear form
        target.text.value = '';
    },
      'click #borrar' () {
        event.preventDefault();
        let a=Questions.find().fetch();
        a.forEach(function f(elem){
            Questions.remove(elem._id);
        });
    },
});


Template.listOfQuestions.helpers({
    questions() {
        return Questions.find({}, {
            sort: {
                votesUp: -1//createdAt: -1
            }
        });
    }
});


Template.question.helpers({
    diff() {
        return this.votesUp - this.votesDown;
    },
    comments() {
        return this.comments;
    },
    posORneg() {
        let state = "";
        if ((this.votesUp - this.votesDown)>0) {state="positive"}
        else if ((this.votesUp - this.votesDown)<0) {state="negative"}
        return state;
    },
    alreadyUp() {
       let cookie = Cookie.get("caseRetreatVote");
       return (cookie && cookie.indexOf(this._id+"+")>=0)? "alreadyUp" : "";
    },
    alreadyDown() {
       let cookie = Cookie.get("caseRetreatVote");
       return (cookie && cookie.indexOf(this._id+"-")>=0)? "alreadyDown" : "";
    }
});

Template.question.events({

    'click .voteUp' (event) {
        // Prevent default browser form submit
        event.preventDefault();
        // Check if previously voted
        let cookie = Cookie.get("caseRetreatVote");
        if (true || !cookie || cookie.indexOf(this._id)<0) {
            Questions.update({
                _id: this._id
            }, {
                $set: {
                    votesUp: this.votesUp + 1
                }
            });
            let newCookie = this._id+"+";
            if (cookie) { newCookie = newCookie + " "+cookie;}
            Cookie.set("caseRetreatVote", newCookie);
        } else {
            console.log("Sorry, only one vote per person per question");
        }
    },
    'click .voteDown' (event) {
        // Prevent default browser form submit
        event.preventDefault();
        let cookie = Cookie.get("caseRetreatVote");
        if (true ||  !cookie || cookie.indexOf(this._id)<0) {
            Questions.update({
                _id: this._id
            }, {
                $set: {
                    votesDown: this.votesDown + 1
                }
            });
            let newCookie = this._id+"-";
            if (cookie) { newCookie = newCookie + " "+cookie;}
            Cookie.set("caseRetreatVote", newCookie);
        } else {
            console.log("Sorry, only one vote per person per question");
        }
    },
    'click .toggleComments' (event){
        event.preventDefault();
        let currentText = event.target.innerHTML;
        if (currentText=="Show / Add comments") {
            event.target.innerHTML="Hide comments";
            $('#comments_'+this._id).collapse('toggle');
        } else {
            event.target.innerHTML="Show / Add comments";
            $('#comments_'+this._id).collapse('toggle');
        }
   },
    'submit .new-comment' (event) {
        // Prevent default browser form submit
        event.preventDefault();

        // Get value from form element
        const target = event.target;
        const text = target.text.value;
        let comments = this.comments
        comments.push(text);
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
