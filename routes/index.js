var express = require('express');
var _ = require("underscore");
var fs = require("fs");

var router = express.Router();

// read json data
var data_obj = JSON.parse(fs.readFileSync('public/json/data.json', 'utf8'));

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

/**
 * To find session by session time
 * /session_time/:session_time e.g. /session_time/morning will find morning session
 * session_time can be from "morning" or "after-noon"
 * Developed by "ar"
 * API - 1
 */
router.get('/session_time/:session_time', async (req, res) => {
  res.status(200).json({ "status": 1, "message": "Under developement" });
});

/**
 * To find next session
 * /session/next/:type e.g. /session/next/session will find next session
 * type can be from "session" or "break"
 * Developed by "ar"
 * API - 2/3
 */
router.get('/session/next/:type', async (req, res) => {
  res.status(200).json({ "status": 1, "message": "Under developement" });
});

/**
 * To find session by speaker
 * /speaker/:speaker_name e.g. /speaker/Ashish will find all session of Ashish
 * Developed by "ar"
 * API - 4
 */
router.get('/speaker/:speaker_name', async (req, res) => {
  try {
    let sessions = await _.where(data_obj,{"Presenter":req.params.speaker_name});
    if(sessions.length > 0){
      res.status(200).json({"status":1,"message":"Speaker's session found","sessions":sessions});
    } else {
      res.status(400).json({"status":0,"message":"No session found for given speaker"});
    }
  } catch (err) {
    res.status(500).json({ "status": 0, "message": "Error in finding session by speaker name" });
  }
});

/**
 * To find session by name
 * /session/:speaker_name e.g. /session/Welcome will find session having name "Welcome"
 * Developed by "ar"
 * API - 5
 */
router.get('/session/:session_name', async (req, res) => {
  try {
    let sessions = await _.where(data_obj,{"Event":req.params.session_name});
    if(sessions.length > 0){
      res.status(200).json({"status":1,"message":"Session data found","sessions":sessions});
    } else {
      res.status(400).json({"status":0,"message":"No session found for given session name"});
    }
  } catch (err) {
    res.status(500).json({ "status": 0, "message": "Error in finding session" });
  }
});

module.exports = router;
