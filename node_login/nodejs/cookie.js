var http = require('http');
var cookie = require('cookie');

http.createServer(function(request, response){
    console.log(request.headers.cookie);
    
    var cookies = {};
    if(request.headers.cookie !== undefined){
        cookies = cookie.parse(request.headers.cookie); //cookie 객체화
    }
    console.log(cookies.yummy_cookie);
    response.writeHead(200, {
        'Set-Cookie':[
            'yummy_cookie=choco', 'tasty_cookie=strawberry',
            'Permanent=cookies; Max-Age=${60*60*24*30}',
            'Secure=Secure; Secure',    //Secure = only https
            'HttpOnly=HttpOnly; HttpOnly',      //Javascript not access
            'Path=Path; Path=/cookie',       //localhost:3000/cookie 일때만 쿠키 발생
            'Domain=Domain; Domain=o2.org'
        ]     
    });
    response.end('Cookie!!');
}).listen(3000);