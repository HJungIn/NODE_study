var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var sanitizeHtml = require('sanitize-html');
var template = require('../lib/template.js');

var shortid = require('shortid');
var db = require('../lib/db');
var bcrypt = require('bcrypt');

module.exports = function (passport) {
    router.get('/login', function(request, response) {
        var fmsg = request.flash();
        var feedback = '';
        if(fmsg.error) {
            feedback = fmsg.error[0];
        }
        var title = 'WEB - login';
        var list = template.list(request.list);
        var html = template.HTML(title, list, `
            <div style="color:red;">${feedback}</div>
            <form action="/auth/login_process" method="post">
                <p><input type="text" name="email" placeholder="email"></p>
                <p><input type="password" name="pwd" placeholder="password"></p>
                <p>
                    <input type="submit" value="login">
                </p>
            </form>
        `, '');
        response.send(html);
    });

    router.post('/login_process', passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/auth/login',
        failureFlash: true,
        successFlash: true
    }));

    router.get('/register', function (request, response) {
        var fmsg = request.flash();
        var feedback = '';
        if (fmsg.error) {
            feedback = fmsg.error[0];
        }
        var title = 'WEB - login';
        var list = template.list(request.list);
        var html = template.HTML(title, list, `
            <div style="color:red;">${feedback}</div>
            <form action="/auth/register_process" method="post">
                <p><input type="text" name="email" placeholder="email" value="egoing7777@gmail.com"></p>
                <p><input type="password" name="pwd" placeholder="password" value="111111"></p>
                <p><input type="password" name="pwd2" placeholder="password" value="111111"></p>
                <p><input type="text" name="displayName" placeholder="display name" value="egoing"></p>
                <p>
                    <input type="submit" value="register">
                </p>
            </form>
        `, '');
        response.send(html);
    });

    router.post('/register_process', function(request, response) {
        var post = request.body;
        var email = post.email;
        var pwd = post.pwd;
        var pwd2 = post.pwd2;
        var displayName = post.displayName;

        if(pwd !== pwd2) {
            request.flash('error', 'Password must same!');
            response.redirect('/auth/register');
        } else {
            bcrypt.hash(pwd, 10, function (err, hash) {

                // 회원가입 시 이메일과 일치하는 사용자가 있는지 db.json에서 검색
                var user = db.get('users').find({email: email}).value();

                // 사용자가 있다면 이 사용자의 정보에 password와 displayName을 추가한다.
                if(user){
                    user.password = hash;
                    user.displayName = displayName;
                    db.get('users').find({id:user.id}).assign(user).write(); // 변경된 user의 값을 DB에 반영한다.
                } else { // 없다면 회원가입 절차 진행하기
                    var user = {
                        id: shortid.generate(),
                        email: email,
                        password: hash,
                        displayName: displayName
                    };
                    db.get('users').push(user).write();
                }

                request.login(user, function (err) {
                    console.log('redirect');
                    return response.redirect('/');
                });
            });
        }
    });

    router.get('/logout', function (request, response) {
        request.logout();
        request.session.destroy(function(err) {
            response.redirect('/');
        });
    });

    return router;
}
