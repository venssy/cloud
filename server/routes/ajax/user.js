var mongoose = require('mongoose')
mongoose.Promise = global.Promise;
var fs = require('fs')
var path = require('path')

var db = require(path.resolve(__dirname, '..', '..', 'mongoose/db'))
var User = require(path.resolve(__dirname, '..', '..', 'mongoose/User'))

var admin = {
  uid: 0, 
  account: 'admin',
  password: 'admin123',
  position: 'admin',
  sign: '使生如夏花之灿烂。',
  msg: {
    sex: 'male'
  }
}

var member = {
  uid: 1, 
  account: 'member',
  password: 'member123',
}

User.remove({uid: 0}).exec((err,doc)=>{
  new User(admin).save()
})
User.remove({uid: 1}).exec((err,doc)=>{
  new User(member).save()
})


var express = require('express');
var router = express.Router();

router.get('/login',(req, res) => {

  if (process.env.NODE_ENV === 'dev') {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
    res.header('Access-Control-Allow-Methods', 'POST, GET');
  }

  console.log('?GET login',req.query)

  if (!req.query.account) {
    res.send({state: 1001}) //用户名为空
    return
  }

  if (!req.query.password) {
    res.send({state: 1002}) //密码为空
    return
  }

  User.findOne({account:req.query.account},{_id:0,__v:0},(err,user) => {
    if (err) {
      console.log(__dirname,' ERROR:\n',err)
      res.send({state:3001}) //数据库错误
      return 
    }
    if (user) {
      if (req.query.password === user.password) {
        req.session.isLogin = true
        req.session.user = user
        console.log('?login',req.session)
        res.send({state:1,user}) //登入成功
      } else {
        res.send({state:1004}) //密码错误
      }
    } else {
      res.send({state:1003}) //用户名不存在
    }
  })
})

router.get('/logoff',(req, res) => {

  if (process.env.NODE_ENV === 'dev') {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
    res.header('Access-Control-Allow-Methods', 'POST, GET');
  }
  console.log('?GET logoff')
  req.session.isLogin = false
  req.session.user = null
  res.send({state:1})

})

router.post('/changeSign', (req, res) => {
  if (process.env.NODE_ENV === 'dev') {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
    res.header('Access-Control-Allow-Methods', 'POST, GET');
  }
  console.log('?POST changeSign',req.body)
  if (req.session.isLogin) {
    if (!req.body.sign) {
      res.send({state:1002}) //个性签名为空
    } else {
      if (req.body.sign.length > 30) {
        res.send({state:1003}) //个性签名超过30个字符
      } else {
        User.update({account: req.session.user.account},{$set: {sign: req.body.sign}}, err => {
          if (err) {
            console.log(__dirname,' Error:\n', err)
            res.send({state:3001}) //数据库更新错误
          } else {
            req.session.user.sign = req.body.sign
            res.send({state:1}) //成功
          }
        })
      }
    }
  } else {
    res.send({state:2001}) //尚未登入
  }
})

router.post('/changeSex', (req, res) => {
  if (process.env.NODE_ENV === 'dev') {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
    res.header('Access-Control-Allow-Methods', 'POST, GET');
  }
  console.log('?POST changeSex',req.body)
  if (!req.session.isLogin) {
    res.send({state:2001}) //尚未登入
    return
  }
  if (!req.body.sex) {
    res.send({state:1001}) //性别为空
    return
  }
  if (req.body.sex != 'secret' && req.body.sex != 'male' && req.body.sex != 'female' && req.body.sex != 'other' ) {
    res.send({state:1002}) //性别不为给定值
    return
  }
  User.update({account: req.session.user.account},{$set: {'msg.sex': req.body.sex}}, err => {
    if (err) {
      console.log(__dirname,' Error:\n', err)
      res.send({state:3001}) //数据库更新错误
      return
    }
    req.session.user.msg.sex = req.body.sex
    res.send({state:1}) //成功
  })
})






module.exports = router