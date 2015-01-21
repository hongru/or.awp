//config
var fs = require('fs-extra');
var inquirer = require('inquirer');
var gitConfig = require('git-config');
var chalk = require('chalk');

var HOME = process.env.HOME || process.env.USERPROFILE || process.env.HOMEPATH;  
var AWP_USER_CONFIG = HOME + '/.or/awp.user.json';
var AWP_APP_CONFIG = HOME + '/.or/awp.app.json';

//fs.ensureFile(AWP_APP_CONFIG)

function setDefaultApp () {
    var o = {
        name: 'mfe',
        did: 577,
        oid: 267
    }
    addApp(o);
}
function addApp (o) {
    fs.ensureFile(AWP_APP_CONFIG, function (err) {
        var con = fs.readFileSync(AWP_APP_CONFIG, {encoding:'utf8'});
        var appConfig = {};
        try {
            appConfig = JSON.parse(con);
        }catch(e) {}
        if (appConfig.apps == undefined) {
            appConfig.apps = []
        }
        appConfig.apps.push(o);

        fs.writeFileSync(AWP_APP_CONFIG, JSON.stringify(appConfig), {encoding:'utf8'});
    })
}

// set default app `mfe`
if (!fs.existsSync(AWP_APP_CONFIG)) {
    setDefaultApp();
}

module.exports = {
    setUserConfig: function (cb) {
        var nick = gitConfig.sync().user.name;
        var _cfg = this.getUserConfig() || {};
        inquirer.prompt([
            {
                name: 'nick',
                type: 'input',
                message: '请输入你的花名',
                default: _cfg.nick || nick
            },
            {
                name: 'dToken',
                type: 'input',
                message: '请输入你的AWP平台'+chalk.cyan('`日常`')+'环境Token',
                default: _cfg.dToken
            },
            {
                name: 'oToken',
                type: 'input',
                message: '请输入你的AWP平台'+chalk.cyan('`预发/线上`')+'环境Token',
                default: _cfg.oToken
            }
        ], function (o) {
            fs.writeFileSync(AWP_USER_CONFIG, JSON.stringify(o), {encoding:'utf8'});
            cb && cb(o);
        })
    },
    setAppConfig: function (cb) {
        var me = this;
        inquirer.prompt([
            {
                name: 'name',
                type: 'input',
                message: '应用名(最好以应用对应的目录命名)'
            },
            {
                name: 'did',
                type: 'input',
                message: '应用在AWP'+chalk.cyan('日常') + '环境id'
            },
            {
                name: 'oid',
                type: 'input',
                message: '应用在AWP'+chalk.cyan('预发/线上') + '环境id'
            }
        ], function (o) {
            addApp(o);
            inquirer.prompt([
                {
                    name: 'isContinue',
                    type: 'confirm',
                    message: '是否继续录入？'
                }
            ], function (o) {
                if (o.isContinue) {
                    me.setAppConfig(cb);
                } else {
                    cb && cb();
                }
            })
        })
    },
    getUserConfig: function () {
        return fs.existsSync(AWP_USER_CONFIG) ? JSON.parse(fs.readFileSync(AWP_USER_CONFIG, {encoding:'utf8'})) : null;
    },
    getAppConfig: function () {
        return fs.existsSync(AWP_APP_CONFIG) ? JSON.parse(fs.readFileSync(AWP_APP_CONFIG, {encoding:'utf8'})) : null;
    },
    setConfig: function (cb) {
        var me = this;
        me.setUserConfig(function () {
            inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'isContinueAppConfig',
                    message: '默认发布应用为'+chalk.cyan('mfe')+'，是否需要录入别的应用id和name？',
                    default: false
                }
            ], function (o) {
                if (o.isContinueAppConfig) {
                    me.setAppConfig(cb);
                } else {
                    cb && cb();
                }
            });
        })
    },
    addApp: addApp
};
