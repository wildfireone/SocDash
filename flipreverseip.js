/**
 * @Author: John Isaacs <john>
 * @Date:   21-Aug-182018
 * @Filename: reverseip.js
 * @Last modified by:   john
 * @Last modified time: 21-Aug-182018
 */
 var dns = require('dns');
 module.exports = {
   reverseLookup: function(ip) {
     dns.reverse(ip,function(err,domains){
    		if(err!=null)	console.log(err);
    		domains.forEach(function(domain){
    			dns.lookup(domain,function(err, address, family){
    				console.log(domain,'[',address,']');
    				console.log('reverse:',ip==address);
    			});
    		});
    	});
   }
 }
