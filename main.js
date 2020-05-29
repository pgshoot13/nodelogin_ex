var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');

var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html');

function templateHTML(title, list, body, control){
    return `
    <!doctype html> 
    <html>
    <head>
        <title>WEB1 - ${title}</title>
        <meta charset="utf-8">
    </head>
    <body>
        <h1><a href="/">WEB</a></h1>
        ${list}
        ${control}
        ${body}
    </body>
    </html>
    `;
}

function templateList(filelist){
    var list = '<ul>';
    var i = 0;
    while(i< filelist.length){
        //<a href="/?id=${filelist[i]}"></a>        //hyperlink
        list += `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
        i += 1;
    }
    list = list + '</ul>';

    return list;
}



var app = http.createServer(function(request,response){

    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;

    if(pathname == '/'){    //root path
        if(queryData.id == undefined){  //3000/null = home

            fs.readdir('./data', function(error, filelist){ //find data dir
 
                var title = 'Welcom Home';
                var description = 'Hello, Node.js';
                var list = template.list(filelist);
                var body = `<h2>${title}</h2>${description}`;
                var control = `<a href="/create">create</a>`;

                var html = template.HTML(title, list, body, control);

                response.writeHead(200);
                response.end(html);
            });
        } else {
            fs.readdir('./data', function(error, filelist){ //find data dir
                var filteredId = path.parse(queryData.id).base; //hide file path
                fs.readFile(`data/${filteredId}`, 'utf8', function(err,description){

                    var title = queryData.id;   //3000/?id=HTML
                    var sanitizedTitle = sanitizeHtml(title);   //sanitizedTitles hide <script> tag
                    var sanitizedDescription = sanitizeHtml(description, {
                        allowedTags:['h1']
                    });
                    var list = template.list(filelist);
                    var body = `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`;
                    var control = 
                    `<a href="/create">create</a> 
                     <a href="/update?id=${sanitizedTitle}">update</a>
                     <form action="delete_process" method="post">
                        <input type="hidden" name="id" value="${sanitizedTitle}">
                        <input type="submit" value="delete">
                    </form>
                    `;

                    var html = template.HTML(title, list, body, control);
        
                    response.writeHead(200);
                    response.end(html);
                });
            });
        }
    } else if(pathname == '/create'){

        fs.readdir('./data', function(error, filelist){ //find data dir
 
            var title = 'WEB - create';
            var description = 'Hello, Node.js';
            var list = template.list(filelist);
            var html = template.HTML(title, list, `
            <form action="/create_process" method="POST">
                <p><input type="text" name="title" placeholder="title"></p>
                <p>
                    <textarea name="description" placeholder="description"></textarea>
                </p>
                <p>
                    <input type="submit">
                </p>
            </form>
            `, ``);
            response.writeHead(200);
            response.end(html);
        });
    } else if(pathname == '/create_process'){

        var body = '';
        request.on('data', function(data){
            body += data;
        });
        request.on('end', function(){
            var post = qs.parse(body);
            var title = post.title;
            var description = post.description;
            fs.writeFile(`data/${title}`, description, 'utf8', function(err){
                response.writeHead(302, {Location: `/?id=${title}`});   //redirection
                response.end('success');
            })
        });
    } else if(pathname == '/update'){
        fs.readdir('./data', function(error, filelist){ //find data dir
            var filteredId = path.parse(queryData.id).base; //hide file path
            fs.readFile(`data/${filteredId}`, 'utf8', function(err,description){

                var title = queryData.id;   //3000/?id=HTML
                var list = template.list(filelist);
                var body = `<h2>${title}</h2>${description}`;
                var control = 
                `
                <form action="/update_process" method="POST">
                    <input type="hidden" name="id" value="${title}">
                    <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                    <p>
                        <textarea name="description" placeholder="description">${description}</textarea>
                    </p>
                    <p>
                        <input type="submit">
                    </p>
                </form>`;

                var html = template.HTML(title, list, body, control);
    
                response.writeHead(200);
                response.end(html);
            });
        });
    } else if(pathname == '/update_process'){
        var body = '';
        request.on('data', function(data){
            body += data;
        });
        request.on('end', function(){
            var post = qs.parse(body);
            var id = post.id;
            var title = post.title;
            var description = post.description;

            fs.rename(`data/${id}`, `data/${title}`, function(error){
                fs.writeFile(`data/${title}`, description, 'utf8', function(err){
                    response.writeHead(302, {Location: `/?id=${title}`});   //redirection
                    response.end('success');
                })                
            })
        });
    } else if(pathname == '/delete_process'){
        var body = '';
        request.on('data', function(data){
            body += data;
        });
        request.on('end', function(){
            var post = qs.parse(body);
            var id = post.id;

            fs.unlink(`data/${id}`, function(error){
                response.writeHead(302, {Location: `/`});   //go home
                response.end();
            })
        });
    } else {    //error path
        response.writeHead(404);    //
        response.end('Not found');
    }           
});
app.listen(3000);
// app.listen(80);  default