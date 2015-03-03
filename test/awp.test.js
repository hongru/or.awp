var assert = require('assert');
var Awp = require('../src/awp');
var fs = require('fs');

var mock = {
    'getRequestUri': [
        {
            in: ['waptest', 577],
            out: 'http://daily.h5.taobao.org/api/api.do?_input_charset=utf-8&api=push_file&webappId=577'
        },
        {
            in: ['wapa', 267],
            out: 'http://pre.h5.taobao.org/api/api.do?_input_charset=utf-8&api=push_file&webappId=267'
        },
        {
            in: ['m', 267],
            out: 'http://h5.taobao.org/api/api.do?_input_charset=utf-8&api=push_file&webappId=267'
        }
    ],
    'getRequestParam': [
        {
            in: [
                {
                    api: 'push_file',
                    t: Date.now(),
                    operator: null, //花名，必须
                    token: null, // 日常或者线上的发布者awp token
                    data: {
                            uri: null, // 必须 发布路径
                            operator: null, // 必须
                            data: null, // 必须 file content
                            isPub: true, // 发布或者预览
                            webappId: null,// 必须
                            pageData: {
                                isautoparse: false, // 是否auto parse
                                needPerform: false, // 是否需要摩天轮性能测试
                                autoPub: false, //是否自动发布tms
                                delVersionIfExist: false //是否删除已经存在的版本
                            }
                        }
                },
                {
                    operator: '岑安',
                    env: 'waptest',
                    token: '288c6d54274369b08e5511e78f0bf97e',
                    appid: 577,
                    filePath: './test/a.html',
                    publishDir: 'mfe/'
                }
            ],
            out: { api: 'push_file',
  t: 1425352523161,
  operator: '岑安',
  token: 'd9ce071cf77caa2426a80d639d36b5e0',
  data: '{"uri":"mfe/a.html","operator":"岑安","data":"<!DOCTYPE html>\n<html>\n\t<head>\n\t\t<meta charset="utf-8" />\n        <meta name="apple-touch-fullscreen\\" content=\\"yes\\"/>\\n        <meta content=\\"width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0\\" name=\\"viewport\\" />\\n        <meta content=\\"yes\\" name=\\"apple-mobile-web-app-capable\\" />\\n        <meta content=\\"black\\" name=\\"apple-mobile-web-app-status-bar-style\\" />\\n        <meta name=\\"format-detection\\" content=\\"telephone=no\\" />\\n\\n        <title>demo</title>\\n\\t</head>\\n\\n\\t<body>\\n\\t\\tPublish Test!\\n\\t</body>\\n</html>","isPub":true,"webappId":577,"pageData":"{\\"isautoparse\\":false,\\"needPerform\\":false,\\"autoPub\\":false,\\"delVersionIfExist\\":false}"}' }
        }
    ]
}

describe('Awp.prototype', function () {
    describe('.getRequestUri(env, appid)', function () {
        it('should return correct uri', function () {
            mock.getRequestUri.forEach(function (o) {
                assert.equal(o.out, Awp.prototype.getRequestUri(o.in[0], o.in[1]));
            })
        })
    });

    describe('.getRequestParam(defaults, opt)', function () {

        mock.getRequestParam.forEach(function (o, i) {
                var out = Awp.prototype.getRequestParam(o.in[0], o.in[1]);
                var data = JSON.parse(out.data);

                it('`t` should not equal', function () { assert.notEqual(o.out.t, out.t); })
                it('`token` should not equal', function() { assert.notEqual(o.out.token, out.token); })
                it('`uri` should equal', function () { assert.equal('mfe/a.html', data.uri); })
                it('`operator` should equal', function () { assert.equal('岑安', data.operator); })
                it('`fileString` should equal', function () { assert.equal(fs.readFileSync('./test/a.html', {encoding:'utf8'}), data.data); })
                it('`isPub` should equal', function () { assert.equal(true, data.isPub); })
                it('`webappId` should equal', function () { assert.equal(577, data.webappId); })
                it('`pageData` should equal', function () { assert.equal(JSON.stringify({
                                isautoparse: false, // 是否auto parse
                                needPerform: false, // 是否需要摩天轮性能测试
                                autoPub: false, //是否自动发布tms
                                delVersionIfExist: false //是否删除已经存在的版本
                            }), data.pageData); })
            })
    });

    describe('.request(uri, param)', function () {
        it('should request with correct successCallback & failCallback', function () {
            //todo
        })
    })

});