#!/usr/bin/env node

var program = require('commander');
var glob = require('glob');
var chalk = require('chalk');
var inquirer = require('inquirer');
var path = require('path');
var fs = require('fs');

//var Pub2awp = require('../index');
var BatchPublisher = require('../src/publisher');
var config = require('../src/config');
var pkg = require('../package.json');

function Bool(val) {
    "use strict";
    return !(val === 'false');
}
var successLog = function (str) {
    return console.log(chalk.green.bold('[Success] ') + str);
};
var failLog = function (str) {
    return console.log(chalk.red.bold('[Fail] ') + str);
};
var errorLog = function (str) {
    return console.log(chalk.red.bold('[Error] ') + str);
}
var infoLog = function (str) {
    return console.log(chalk.yellow.bold('[Info] ') + str);
}

program
    .version(pkg.version)
    .usage('[options] <file ...>')
    .option('-p, --project [value]', '项目名')
    .option('-g, --group [value]', '应用名，默认为 mfe ')
    .option('-e, --env [value]', '发布环境（waptest|日常,wapa|预发,wapp|线上预览,m|线上）')
    .option('-o, --operator [value]', '发布者花名')
    .option('--dtoken, --dailytoken [value]', '发布者日常环境 token')
    .option('--otoken, --onlinetoken [value]', '项目预发/线上环境 token')
    .option('--did, --dailyid [value]', '项目日常环境 WebAppId')
    .option('--oid, --onlineid [value]', '项目预发/线上环境 WebAppId')
    .option('--pub, --ispub [boolean]', '是否性能测试通过后自动发布', Bool)
    .option('--autopub, --isautopub [boolean]', '是否 tms 区块更新时自动发布', Bool)
    .option('--autoparse, --isautoparse [boolean]', '是否需要 AWP 平台自动解析资源', Bool)
    .option('--needperformtest, --needperform [boolean]', '是否需要 AWP 性能测试', Bool)
    .option('--delversion, --delversionifexist [boolean]', '是否需要删除已存在的版本', Bool)
    .option('config', '配置 AWP 发布默认参数')
    .parse(process.argv);


if (program.config) {
    setConfig();
} else {
    // 发布
    directPublish();
}


function setConfig () {
    config.setConfig();
}
function directPublish () {
    // var awp = new Pub2awp({
    //     operator: '岑安',
    //     env: 'waptest',
    //     token: '288c6d54274369b08e5511e78f0bf97e',
    //     appid: '577',
    //     filePath: 'test/a.html',
    //     publishDir: 'mfe/test/'
    // });

    if (!config.getUserConfig()) {
        //return failLog('请先输入命令 ' + chalk.green('awp config') + ' 配置你的个人信息 :)');
        config.setConfig(function () {
            doPublish();
        });
    } else {
        doPublish();
    }



    // __getFiles(function (files) {
    //     console.log(files)
    //     if (!files.length) {
    //         return console.warn('请指定你要发布的页面！');
    //     }
    //     //new BatchPublisher(files);
    // })
}
function commandPublish () {

}

function doPublish () {
    __getFiles(function (files) {
        program.files = files;
        __checkArgs(function () {
            (new BatchPublisher(program)).start();
        })
    })
}

function __checkArgs (cb) {
    // env, group, project 必须
    if (!program.env) {
        inquirer.prompt([
            {
                type: 'list',
                name: 'env',
                message: '请选择要发布的环境',
                choices: [
                    'waptest[日常]',
                    'wapa[预发]',
                    'm[线上]'
                ],
                default: 0
            }
        ], function (o) {
            program.env = o.env.replace(/\[.*\]/, '');
            __do();
        })
    } else {
        __do();
    }

    function __do () {
        if (!program.group) {
            program.group = 'mfe';
            infoLog('没有指定应用名，默认将发布到'+chalk.cyan('mfe'));
            _next();
        } else {
            var apps = config.getAppConfig().apps;
            var isIn = false;
            for (var i = 0; i < apps.length; i ++) {
                if (apps[i].name === program.group) {
                    isIn = true;
                    break;
                }
            }
            if (!isIn) {
                infoLog('没有找到指定的应用配置，请先录入' + chalk.cyan(program.group) + '应用配置');
                inquirer.prompt([
                    {
                        type: 'input',
                        name: 'did',
                        message: chalk.yellow(program.group) + '应用在AWP'+chalk.cyan('日常') + '环境id'
                    },
                    {
                        type: 'input',
                        name: 'oid',
                        message: chalk.yellow(program.group) + '应用在AWP'+chalk.cyan('预发/线上') + '环境id'
                    }
                ], function (o) {
                    o.name = program.group;
                    config.addApp(o);
                    _next();
                })
            } else {
                _next();
            }
        }

        function _next () {
            if (!program.project) {
                program.project = '';
                infoLog('没有指定项目目录，默认发布到应用根目录' + chalk.cyan(program.group + '/'));
            }

            var pubUrls = [];
            program.files.forEach(function (p) {
                var fileName = path.basename(p);
                var url = 'http://h5.'+program.env+'.taobao.com/'+program.group+'/' + (!!program.project ? program.project + '/' : '') + fileName;
                pubUrls.push(url);
            });
            //console.log(pubUrls)
            var info = [];
            pubUrls.forEach(function (p, i) {
                info.push(program.files[i] + chalk.yellow.bold(' -> ') + p);
            });
            inquirer.prompt([
                {
                    name: 'surePub',
                    type: 'confirm',
                    message: '本次操作将发布页面到如下地址，确认？\n' + info.join('\n') + '\n'
                }
            ], function (o) {
                if (o.surePub) {
                    cb && cb();
                }
            })    
        }
        
    }
}

function __getAllHtml (root) {
      var result = [], files = fs.readdirSync(root)
      files.forEach(function(file) {
        var pathname = root+ "/" + file
          , stat = fs.lstatSync(pathname)
        if (stat === undefined) return

        if (!stat.isDirectory()) {
            if (/\.htm(l)?$/.test(file)) {
                result.push(pathname)
            }
        } else {
            if (!/^node_modules$/.test(file) && !/^\.git/.test(file)) {
                result = result.concat(__getAllHtml(pathname))
            }
        }
      });
      return result
}

function __getFiles (cb) {
    var ret = [];
    var i = 0;
    if (program.args.length > 0) {
        program.args.forEach(function (arg) {
            //只支持发布 html,htm 文件
            if (/\.htm(l)?$/.test(arg)) {
                i ++;
                glob(arg, function (err, files) {
                    ret.push(files);
                    if (ret.length === i) {
                        var r = [];
                        ret.forEach(function (arr) {
                            r = r.concat(arr);
                        });
                        r = _filterPath(r);
                        cb && cb(r);
                    }
                });
            }
        });
    } else {
        // 寻找 process.cwd() 下可以发布的html,htm 文件
        var cwd = process.cwd();
        var htmlArr = __getAllHtml(cwd);
        htmlArr.forEach(function (p, i) {
            htmlArr[i] = path.relative(cwd, p);
        });
        if (htmlArr.length) {
            inquirer.prompt([
                {
                    name: 'htmlPath',
                    type: 'checkbox',
                    choices: htmlArr,
                    message: '在当前目录找到以下文件可供发布(可多选)',
                    default: [htmlArr[0]]
                }
            ], function (o) {
                //console.log(o)
                if (!o.htmlPath.length) {
                    return failLog('你未选择任何页面');
                } 
                cb && cb(o.htmlPath);
            })    
        } else {
            failLog('当前目录下没找到可以发布的 html/htm 文档');
        }
        
    }

    function _filterPath (arr) {
        var ret = [];
        var hash = {};
        arr.forEach(function (str) {
            if (/\.htm(l)?$/.test(str) && !hash[str]) {
                hash[str] = 1;
                ret.push(str);
            }
        });
        return ret;
    }
}
