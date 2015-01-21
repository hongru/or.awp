// publisher 
var Awp = require('./awp');
var config = require('./config');

var Publisher = function (opt) {
    this.opt = opt;
    this.files = opt.files;
    this.interval = 1000; //间隔1000ms
    //console.log(this.files);
}
Publisher.prototype = {
    setInterval: function (t) {
        this.interval = parseInt(t);
        return this;
    },
    start: function () {
        var me = this;
        var user = config.getUserConfig();
        var apps = config.getAppConfig().apps;
        var app;
        for (var i = 0; i < apps.length; i ++) {
            if (apps[i].name === me.opt.group) {
                app = apps[i];
                break;
            }
        }
        //console.log(user, app)

        function walk () {
            if (!me.files || !me.files.length) return;
            var filePath = me.files.shift();
            var awp = new Awp({
                operator: user.nick,
                env: me.opt.env,
                token: me.opt.env === 'waptest' ? user.dToken : user.oToken,
                appid: me.opt.env === 'waptest' ? app.did : app.oid,
                filePath: filePath,
                publishDir: me.opt.group + '/' + (!!me.opt.project ? (me.opt.project + '/') : '')
            });

            if (me.files.length) {
                setTimeout(function () {
                    walk();
                }, me.interval);
            }
        }
        walk();
    }
};

module.exports = Publisher;