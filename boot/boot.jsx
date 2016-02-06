// async load the right files
[
    'client.min.js',
    'srd/core.js'
].reduceRight(function (callback, next) {
    return function () {
        var element = document.createElement('script');
        element.src = next;
        element.onload = callback;
        document.body.appendChild(element);
    }
}, function () {
    Setup(function () {
        ReactDOM.render(React.createElement(App), document.querySelector('[root]'));
        document.getElementById('loading-screen').className = 'hidden';
    });
})();

(function (appCache, wrapper) {
    
    wrapper.STATUS = {
        PENDING: 0,
        NOUPDATE: 1,
        UPDATEREADY: 2,
        CACHED: 4,
        ERROR: 8
    };
    
    wrapper.CURRENT = wrapper.STATUS.PENDING;
    
    var callbacks = [];
    
    wrapper.onChange = function(callback) {
        callbacks.push(callback);
    }
    
    wrapper.update = function(callback) {
        wrapper.CURRENT = wrapper.STATUS.PENDING;
        callbacks.push(callback);
        appCache.update();
    }
    
    appCache.addEventListener('noupdate', function () {
        wrapper.CURRENT = wrapper.STATUS.NOUPDATE;
        callbacks.map(function (cb) { return cb(wrapper.CURRENT); });
        callbacks = [];
    });
    appCache.addEventListener('updateready', function () {
        wrapper.CURRENT = wrapper.STATUS.UPDATEREADY;
        callbacks.map(function (cb) { return cb(wrapper.CURRENT); });
        callbacks = [];
    });
    appCache.addEventListener('cached', function () {
        wrapper.CURRENT = wrapper.STATUS.CACHED;
        callbacks.map(function (cb) { return cb(wrapper.CURRENT); });
        callbacks = [];
    });
    appCache.addEventListener('error', function () {
        wrapper.CURRENT = wrapper.STATUS.ERROR;
        callbacks.map(function (cb) { return cb(wrapper.CURRENT); });
        callbacks = [];
    });
})(window.applicationCache, window.OFFLINE || (window.OFFLINE = {}));