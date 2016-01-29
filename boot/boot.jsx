var PD = {};

// async load the right files
[
    'static/react.min.js',
    'static/react-dom.min.js',
    'client.min.js',
    'static/srd.js'
].reduceRight(function (callback, next) {
    return function () {
        var element = document.createElement('script');
        element.src = next;
        element.onload = callback;
        document.body.appendChild(element);
    }
}, function () {
    // depth search to construct the glossary
    (function deepSearch(phrase, item) {
        if (phrase.length >= 3 && item["_self"]) {
            PD[phrase] = [].concat(item["_self"]);
        }
        Object.keys(item)
            .filter(function (key) {
                return key !== "_self";
            })
            .forEach(function (key) {
                deepSearch(phrase + key, item[key]);
            });
    })('', I.key);
    ReactDOM.render(React.createElement(App), document.querySelector('[root]'));
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