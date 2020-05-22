// array, object

var f = function f1(){  //함수는 값이 될 수 있다.
    console.log(1+1);
    console.log(1+2);
}

console.log(f);
f();

var a = [f];
a[0](); //배열의 원소로서 함수가 가능


var o = {
    func:f
}
o.func();