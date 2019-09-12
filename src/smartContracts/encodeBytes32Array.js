const web3 = require("web3");

var args = process.argv;
var start = 0;
var output = "";
output += '["'+web3.utils.fromAscii(args[2]).padEnd(66,"0")+'"';

args.forEach(function(value) {
    if(start >= 3) {
        var el = web3.utils.fromAscii(value).padEnd(66,"0");
        output += ', "'+el+'"';
    }
    start += 1;
});

output += "]";
console.log(output+"\n");
