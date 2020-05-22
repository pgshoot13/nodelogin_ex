var fs = require('fs');

//readFileSync      ABC
// console.log('A');
// var result = fs.readFileSync('syntax/sample.txt', 'uft8');
// console.log(result);
// console.log('C');



// readFileASync    ACB
console.log('A');
fs.readFile('syntax/sample.txt', 'uft8', function(err, result){
    console.log(result);
});
console.log('C');