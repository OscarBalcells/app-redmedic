const web3 = require("web3");
var args = process.argv;

function isNum(input) {
	return !isNaN(input);
}

function isAddr(input) {
	return input.length == 40;
}

var output = "";
console.log("")

var arg = args[2];
if(isNum(arg) || isAddr(arg)) {
	console.log('"'+arg+'"');
} else {
	console.log('"'+web3.utils.fromAscii(arg).padEnd(66,"0")+'"');
}

for(var i = 3; i < args.length; i++) {
	arg = args[i];
	if(isNum(arg) || isAddr(arg)) {
		console.log('"'+arg+'"');
	} else {
		console.log('"'+web3.utils.fromAscii(arg).padEnd(66,"0")+'"');
	}
}

console.log(output);
