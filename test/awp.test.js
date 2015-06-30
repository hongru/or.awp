var assert = require('assert');
var Awp = require('../src/awp');
var fs = require('fs');
var path = require('path');

var mockOpt = {
    operator: '岑安',
    env: 'waptest',
    token: '288c6d54274369b08e5511e78f0bf97e',
    appid: '276',
    filePath: path.join(__dirname, 'a.html'),
    publishDir: 'src/orawp'
}

var defaults = {
    _input_charset: 'GBK',
    api: 'push_file',
    t: Date.now(),
    operator: null, //花名，必须
    webappId: null,
    token: null, // 日常或者线上的发布者awp token
    data: {
            uri: null, // 必须 发布路径
            operator: null, // 必须
            isPub: true, // 发布或者预览
            webappId: null,// 必须
            pageData: {
                isautoparse: false, // 是否auto parse
                needPerform: false, // 是否需要摩天轮性能测试
                autoPub: false, //是否自动发布tms
                delVersionIfExist: false //是否删除已经存在的版本
            }
        }
}

describe('Awp.prototype', function () {

    describe('.getRequestUri(env, appid)', function () {
        it('instance should get right requestUri', function () {
            //console.log(Awp.prototype.getRequestUri(mockOpt.env, mockOpt.appid))
            assert.equal('http://daily.h5.taobao.org/api/api.do', Awp.prototype.getRequestUri(mockOpt.env, mockOpt.appid));
        })
    })


    describe('.getRequestParam(defaults, opt)', function () {
        it('should publish success', function (done) {
            var pub = new Awp(mockOpt, function () {
                done();
            });
        })
        
        //console.log(Awp.prototype.getRequestParam(defaults, mockOpt))
        
    });

});