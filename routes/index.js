var express = require('express');
var _ = require("underscore");
var moment = require("moment");
var fs = require("fs");
var path = require('path');

var router = express.Router();

// read json data
var data_obj = JSON.parse(fs.readFileSync('public/json/data.json', 'utf8'));

/* GET home page. */
router.get('/', function (req, res, next) {
  // res.render('index', { title: 'Express' });
  res.sendFile(path.join(__dirname, '../doc', 'index.html'));
});

/**
 * To find session by session time
 * /session_time/:session_time e.g. /session_time/morning will find morning session
 * session_time can be from "morning" or "after-noon"
 * Developed by "ar"
 * API - 1
 */

/**
 * @api {get} /session_time/:session_time Find session by session time
 * @apiName Find session by session time
 * @apiGroup Events
 *
 * @apiParam {String} session_time Event session i.e. morning or after-noon
 *
 * @apiSuccess {Number} status 1
 * @apiSuccess {String} message Success message
 * @apiSuccess {JSON} sessions JSON array of filtered Events
 * 
 * @apiError {Number} status 0
 * @apiError {String} message Error message
 */
router.get('/session_time/:session_time', async (req, res) => {
  let clone_obj = JSON.parse(JSON.stringify(data_obj));

  let new_data = clone_obj.map(function (session) {
    session.moment = moment(session.Start, 'H:mm A');
    return session;
  });


  if (req.params.session_time === "morning") {
    let morning_time = moment("12:00 PM",'H:mm A');

    let sessions = new_data.filter(function (session) {
      if (session.moment.isBefore(morning_time) && session["Event Type"] == "Session") {
        delete session.moment;
        return true;
      }
    });

    if (sessions.length > 0) {
      res.status(200).json({ "status": 1, "message": "Morning session found", "sessions": sessions });
    } else {
      res.status(400).json({ "status": 0, "message": "No session found" });
    }

  } else if (req.params.session_time === "after-noon") {

    let evening_time = moment("11:59 AM",'H:mm A');

    let sessions = new_data.filter(function (session) {
      if (session.moment.isAfter(evening_time) && session["Event Type"] == "Session") {
        delete session.moment;
        return true;
      }
    });

    if (sessions.length > 0) {
      res.status(200).json({ "status": 1, "message": "After-noon session found", "sessions": sessions });
    } else {
      res.status(400).json({ "status": 0, "message": "No session found" });
    }

  } else {
    res.status(400).json({ "status": 0, "message": "Invalid session time entered" });
  }
});

/**
 * To find next session
 * /session/next/:type e.g. /session/next/session will find next session
 * type can be from "session" or "break"
 * Developed by "ar"
 * API - 2/3
 */

 /**
 * @api {get} /session/next/:type Find next session or next break
 * @apiName Find next session or next break
 * @apiGroup Events
 *
 * @apiParam {String} type Event type i.e. Session or Break
 *
 * @apiSuccess {Number} status 1
 * @apiSuccess {String} message Success message
 * @apiSuccess {JSON} next_session JSON object of next event
 * 
 * @apiError {Number} status 0
 * @apiError {String} message Error message
 */
 router.get('/session/next/:type', async (req, res) => {
  let current_date = moment();

  let clone_obj = JSON.parse(JSON.stringify(data_obj));

  let new_data = clone_obj.map(function (session) {
    session.moment = moment(session.Date + "-" + session.Start, 'dddd, MMMM Do-H:mm A');
    session.timestamp = session.moment.toDate().getTime();
    return session;
  });

  new_data = _.sortBy(new_data, function (o) { return o.timestamp; })

  let next_session = new_data.filter(function (session) {
    if (session.moment.isAfter(current_date) && session["Event Type"] == req.params.type) {
      delete session.moment;
      delete session.timestamp;
      return true;
    }
  });

  if (next_session) {
    res.status(200).json({ "status": 1, "message": "Next session found", "next_session": next_session[0] });
  } else {
    res.status(400).json({ "status": 0, "message": "No next session found" });
  }
});

/**
 * To find session by speaker
 * /speaker/:speaker_name e.g. /speaker/Ashish will find all session of Ashish
 * Developed by "ar"
 * API - 4
 */

 /**
 * @api {get} /speaker/:speaker_name Find sessions of by speaker
 * @apiName Find sessions of by speaker
 * @apiGroup Events
 *
 * @apiParam {speaker_name} String Speaker name
 *
 * @apiSuccess {Number} status 1
 * @apiSuccess {String} message Success message
 * @apiSuccess {JSON} sessions JSON array contains all session of given speaker
 * 
 * @apiError {Number} status 0
 * @apiError {String} message Error message
 */
 router.get('/speaker/:speaker_name', async (req, res) => {
  try {
    let sessions = data_obj.filter(function (session) {
      if (session.Presenter && session.Presenter.search(req.params.speaker_name) != -1) {
        return true;
      }
    });
    if (sessions.length > 0) {
      res.status(200).json({ "status": 1, "message": "Speaker's session found", "sessions": sessions });
    } else {
      res.status(400).json({ "status": 0, "message": "No session found for given speaker" });
    }
  } catch (err) {
    res.status(500).json({ "status": 0, "message": "Error in finding session by speaker name", "error": err });
  }
});

/**
 * To find session by name
 * /session/:speaker_name e.g. /session/Welcome will find session having name "Welcome"
 * Developed by "ar"
 * API - 5
 */

 /**
 * @api {get} /session/:session_name Find session by event name
 * @apiName Find session by event name
 * @apiGroup Events
 *
 * @apiParam {session_name} String Session name
 *
 * @apiSuccess {Number} status 1
 * @apiSuccess {String} message Success message
 * @apiSuccess {JSON} sessions JSON array contains all filtered session
 * 
 * @apiError {Number} status 0
 * @apiError {String} message Error message
 */
router.get('/session/:session_name', async (req, res) => {
  try {
    let sessions = await _.where(data_obj, { "Event": req.params.session_name });
    if (sessions.length > 0) {
      res.status(200).json({ "status": 1, "message": "Session data found", "sessions": sessions });
    } else {
      res.status(400).json({ "status": 0, "message": "No session found for given session name" });
    }
  } catch (err) {
    res.status(500).json({ "status": 0, "message": "Error in finding session" });
  }
});

module.exports = router;
