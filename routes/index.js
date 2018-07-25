/**
 * @Author: John Isaacs <john>
 * @Date:   18-Aug-172017
 * @Filename: index.js
 * @Last modified by:   john
 * @Last modified time: 24-Aug-172017
 */



var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  board.list(function(err, list) {
    res.render('index', { title: 'Express', leaderboard: JSON.stringify(list) });
  });
});

module.exports = router;
