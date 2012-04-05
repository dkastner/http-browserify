var EventEmitter = require('events').EventEmitter;
var Response = require('./response');

var Request = module.exports = function (xhr, params) {
    var self = this;
    self.xhr = xhr;
    self.body = '';
    
    var uri = params.host + ':' + params.port + (params.path || '/');
    
    xhr.open(
        params.method || 'GET',
        (params.scheme || 'http') + '://' + uri,
        true
    );
    
    if (params.headers && xhr.setRequestHeader) {
        for(key in params.headers) {
            if (Request.isSafeRequestHeader(key)) {
                var value = params.headers[key];
                if (value instanceof Array) {
                    for(var i = 0, j = value.length; i < j; i++) {
                        xhr.setRequestHeader(key, value[i]);
                    }
                }
                else xhr.setRequestHeader(key, value)
            }
        }
    }
    
    var res = new Response;
    res.on('ready', function () {
        self.emit('response', res);
    });
    

    if(window.XDomainRequest && xhr instanceof window.XDomainRequest) {  // IE XDR
        xhr.onprogress = function() {
            xhr.readyState = 2;
            res.getAllResponseHeaders = function() {
              return 'Content-Type: ' + xhr.contentType;  // This is the only header available
            };
            res.handle(xhr);
        }
        xhr.onload = function() {  // IE XDR
            xhr.readyState = 4;
            res.handle(xhr);
        };
        xhr.onerror = function() {  // IE XDR
            xhr.readyState = 4;
            xhr.error = 'Unknown error';
            res.handle(xhr);
        };
    }
    xhr.onreadystatechange = function () {
        res.handle(xhr);
    };
};

Request.prototype = new EventEmitter;

Request.prototype.setHeader = function (key, value) {
    if (!xhr.setRequestHeader) // IE XDR
        return;

    if (value instanceof Array) {
        for (var i = 0; i < value.length; i++) {
            this.xhr.setRequestHeader(key, value[i]);
        }
    }
    else {
        this.xhr.setRequestHeader(key, value);
    }
};

Request.prototype.write = function (s) {
    this.body += s;
};

Request.prototype.end = function (s) {
    if (s !== undefined) this.write(s);
    this.xhr.send(this.body);
};

// Taken from http://dxr.mozilla.org/mozilla/mozilla-central/content/base/src/nsXMLHttpRequest.cpp.html
Request.unsafeHeaders = [
    "accept-charset",
    "accept-encoding",
    "access-control-request-headers",
    "access-control-request-method",
    "connection",
    "content-length",
    "cookie",
    "cookie2",
    "content-transfer-encoding",
    "date",
    "expect",
    "host",
    "keep-alive",
    "origin",
    "referer",
    "te",
    "trailer",
    "transfer-encoding",
    "upgrade",
    "user-agent",
    "via"
];

Request.indexOfHeader = function(headerName) {
    for (var i = 0, j = Request.unsafeHeaders.length; i < j; i++) {
        if (Request.unsafeHeaders[i] === headerName) {
            return i;
        }
    }
    return -1;
};

Request.isSafeRequestHeader = function (headerName) {
    if (!headerName) return false;
    return (Request.indexOfHeader(headerName.toLowerCase()) === -1)
};
