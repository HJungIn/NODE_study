var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var sanitizeHtml = require('sanitize-html');
var template = require('../lib/template.js');

var authData = {
    email: 'egoing777@gmail.com',
    password: '111111',
    nickname: 'egoing'
}

module.exports = function(passport){
        
    router.get('/login', function(request, response) {
        var fmsg = request.flash();
        console.log(fmsg);
        var feedback = '';
        if(fmsg.error){
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

    // router.post('/login_process', function (request, response) {
    //     var post = request.body;
    //     var email = post.email;
    //     var password = post.pwd;
    //     if(email === authData.email && password === authData.password) {
    //         request.session.is_logined = true;
    //         request.session.nickname = authData.nickname;
    //         request.session.save(function() {
    //             response.redirect(`/`);
    //         });
    //     } else {
    //         response.send('Who?');
    //     }
    //     response.redirect(`/`);
    // });

    router.get('/logout', function (request, response) {
        // request.session.destroy(function(err) {
        //     response.redirect('/');
        // });
        request.logout();
        request.session.save(function(err){ // 현재 세션 상태를 세션 스토어에 저장하고, 저장 작업이 끝나면 리다이렉트 진행
            response.redirect('/');
        })
    });

    /*
    router.get('/update/:pageId', function(request, response) {
        var filteredId = path.parse(request.params.pageId).base;
        fs.readFile(`data/${filteredId}`, 'utf8', function(err, description) {
            var title = request.params.pageId;
            var list = template.list(request.list);
            var html = template.HTML(title, list,
                `
                <form action="/topic/update_process" method="post">
                    <input type="hidden" name="id" value="${title}">
                    <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                    <p>
                        <textarea name="description"
                            placeholder="description">${description}</textarea>
                    </p>
                    <p>
                        <input type="submit">
                    </p>
                </form>
                `,
                `<a href="/topic/create">create</a> <a href="/topic/update/${title}">update</a>`
            );
            response.send(html);
        });
    });
    router.post('/update_process', function(request, response) {
        var post = request.body;
        var id = post.id;
        var title = post.title;
        var description = post.description;
        fs.rename(`data/${id}`, `data/${title}`, function(error) {
            fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
                response.redirect(`/topic/${title}`);
                response.end();
            });
        });
    });
    router.post('/delete_process', function(request, response) {
        var post = request.body;
        var id = post.id;
        var filteredId = path.parse(id).base;
        fs.unlink(`data/${filteredId}`, function(error) {
            response.redirect('/');
        });
    });
    router.get('/:pageId', function(request, response, next) {
        var filteredId = path.parse(request.params.pageId).base;
        fs.readFile(`data/${filteredId}`, 'utf8', function(err, description) {
            if(err) {
                next(err);
            } else {
                var title = request.params.pageId;
                var sanitizedTitle = sanitizeHtml(title);
                var sanitizedDescription = sanitizeHtml(description, {
                    allowedTags:['h1']
                });
                var list = template.list(request.list);
                var html = template.HTML(sanitizedTitle, list,
                    `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
                    ` <a href="/topic/create">create</a>
                        <a href="/topic/update/${sanitizedTitle}">update</a>
                        <form action="/topic/delete_process" method="post">
                            <input type="hidden" name="id" value="${sanitizedTitle}">
                            <input type="submit" value="delete">
                        </form>`
                );
                response.send(html);
            }
        });
    });
    */

    router.post('/login_process', passport.authenticate('local', { // 사용하려는 전략, 로그인성공시와 실패시의 이동경로
        successRedirect: '/',
        failureRedirect: '/auth/login',
        failureFlash: true,
        successFlash: true
    }));
    
    return router
}
// module.exports = router;
