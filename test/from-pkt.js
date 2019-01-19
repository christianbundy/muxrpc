var fs = require('fs')
var pull = require('pull-stream')
var psc = require('packet-stream-codec')
var toPull = require('stream-to-pull-stream')
var mux = require('../')




// "dir=out pkt=\"&{Flag:{FlagJSON} Req:1 Body:{\\\"name\\\":[\\\"callme\\\",\\\"source\\\"],\\\"args\\\":[],\\\"type\\\":\\\"async\\\"}}

var examples = [
    { req: 1, stream: false, end: false, value: {  name: [ 'hello' ], args: ['test'], type: "async" } },  // start request
    { req: 1, stream: false, end: false, value: "foo"},

    { req: 2, stream: false, end: false, value: {  name: [ 'hello' ], args: ['world'], type: "async" } },  // start request
    // { req: 2, stream: false, end: false},  // start request


    // { req: -1, stream: false, end: true, value: 'whatever' },
    // { req: -1, stream: false, end: true, value: new Error('intentional')},
    // { req: -1, stream: false, end: true, value: true }, 
    // { req: -1, stream: false, end: true, value: true }, 

    // { req: 2, stream: true, end: false, value: Buffer.from('hello') }, // a stream packet
    // { req: -2, stream: true, end: false, value: Buffer.from('goodbye') }, // a stream response
    // { req: -3, stream: false, end: true, value: flat(new Error('intentional')) },
    // { req: 2, stream: true, end: true, value: true }, // a stream packet
    // { req: -2, stream: true, end: true, value: true }, // a stream response
    'GOODBYE'
]

var client = { hello: 'async' }
var A = mux(client, client, psc)({
    hello: function (a, cb) {
        if (a === 'test') {
            cb(null, 'hello, ' + a)
        } else {
            cb(new Error('ret error - false case'))
        }
    }
})

A.hello('world', (err, data) => {
    console.log('err', err, ' - data', data)
})

var s = A.createStream()

pull(
    pull.values(examples),
    psc.encode(),
    s
)

pull(
    s,
    psc.decode(),
    pull.drain(console.log)
)

