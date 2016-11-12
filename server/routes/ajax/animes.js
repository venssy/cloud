var mongoose = require('mongoose')
var fs = require('fs')
var path = require('path')
var util = require('util');
var co = require('co')
var isDev = require(path.resolve(__dirname, '..', '..', '..', 'my/isDev.js'))

var express = require('express');
var router = express.Router();

mongoose.Promise = global.Promise;

var db = mongoose.connect('mongodb://localhost/haizai')

var animeSchma = new mongoose.Schema({
 id: Number, 
 title: String,
 allTitle: String,
 year: Number,
 info: {
  '导演': String,
  "编剧": String,
  "主演": String,
  "类型": String,
  "首播": String,
  '季数': String,
  "集数": String,
  "单集片长": String,
  "又名": String
 },
 rating: {
  value: Number,
  count: Number,
  start5: Number,
  start4: Number,
  start3: Number,
  start2: Number,
  start1: Number  
 },
 summary: String,
 comments: [String],
 reviews: [{
  title: String,
  html: [String]
 }]
});


var Anime = mongoose.model('Anime', animeSchma);

router.get('/animes', (req, res) => {

  if (isDev) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
    res.header('Access-Control-Allow-Methods', 'POST, GET');
  }

	console.log('?GET animes',req.query)


  let keyword = req.query.keyword ? decodeURIComponent(req.query.keyword).replace(/[\*\.\?\+\$\^\[\]\(\)\{\}\|\\\/]/g,'') : ''
  let skip = (req.query.page && parseInt(req.query.page, 10) > 0) ? parseInt(req.query.page, 10) * 10 - 10 : 0

  let range = 'all'
  let reg = new RegExp(keyword, 'i')
  let findObj = {}

  if (req.query.range) {
    switch (req.query.range) {
      case 'default':
        findObj = {$or: [{allTitle: reg}, {'info.又名': reg}, {'info.主演': reg}, {'info.导演': reg}, {'info.编剧': reg}]}
        break
      case 'title':
        findObj = {$or: [{allTitle: reg}, {'info.又名': reg}]}
        break;
      case 'person':
        findObj = {$or: [{'info.主演': reg}, {'info.导演': reg}, {'info.编剧': reg}]}
        break;
      case 'summary':
        findObj = {summary: reg}
        break;
      case 'all':
        findObj = {$or: [{allTitle: reg}, {'info.又名': reg}, {'info.主演': reg}, {'info.导演': reg}, {'info.编剧': reg}, {summary: reg}]}
        break
      default:
        break;
    }
  }

  let sort = {}

  if (req.query.sort) {
    switch (req.query.sort) {
      case 'year':
        sort = {'year': -1}
        break;
      case 'value':
        sort = {'rating.value': -1}
        break;
      case 'count':
        sort = {'rating.count': -1}
        break;
      default:
        break;
    }
  } 


  co(function* () {
    var animes = yield Anime
      .find(
        findObj,
        {_id: 0, title: 1, allTitle: 1, info: 1, 'rating.count': 1,'rating.value': 1, year: 1, id: 1}
        )
      .sort(sort)
      .limit(10)
      .skip(skip)
      .exec();
    var count = yield Anime.find(findObj).count().exec()

    return yield {animes, count}
  }).then(doc=> {
    res.send(doc)
  }, err => {
    console.error('Error ?GET animes \n',err)
  })

})

router.get('/anime', (req, res) => {

  if (isDev) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
    res.header('Access-Control-Allow-Methods', 'POST, GET');
  }

  console.log('?GET anime',req.query)

    if (req.query.id) {
      Anime.findOne({
        id: req.query.id
      },{
        _id: 0, __v: 0,"reviews._id": 0
      }).exec((err, doc) => {
        if (err) console.error('Error ?GET anime \n',err)
        res.send(doc)
      })
    }
})


module.exports = router;
