var PATHS = null;

var TOC = null;

var TEMPLATES = null;

var SRD = null;

var SOURCE = {};

var KEYS = {
    a: 'articles',
    t: 'template',
    d: 'data',
    l: 'lookup'
};

var CleanSlate = function () {
    PATHS = null;
    TOC = null;
    TEMPLATES = null;
    SRD = null;
};

var Setup = (function () {
    
    function articlePathFactory(source, route) {
        return {
            title: SRD[source].articles[SRD[source].lookup[route]].title,
            render: function () {
                var markup = {
                    __html: SRD[source].articles[SRD[source].lookup[route]].body
                };
                return <div dangerouslySetInnerHTML={markup}/>;
            }
        }
    }
    
    function sourcePathFactory(source) {
        return {
            title: source.name,
            render: function () {
                return <h1>{source.name}</h1>
            }
        }
    }
    
    function templatePathFactory(key) {
        return {
            title: TEMPLATES[key].template.prototype.title || makePresentable(key),
            render: function () {
                var table = null;
                
                if (TEMPLATES[key].data) {
                    table = React.createElement(
                        TEMPLATES[key].template,
                        {
                            data: TEMPLATES[key].data
                        });
                } else {
                    table = <div className="aside"><em>Nothing found - try loading some supplements from </em><a href="#/guide">the Guide</a></div> 
                }
                
                return <div>
                    <h5>{TEMPLATES[key].template.prototype.title || makePresentable(key)}</h5>
                    {table}
                </div>;
            }
        }
    }
    
    function addToPaths(path, value) {
        PATHS[path] = value;
    }
    
    function addToToc(path, value) {
        var segments = []
            .concat(path.split('/'))
            .reverse();
        
        var root = TOC;
        
        while(segments.length) {
            var segment = segments.pop();
            root = (root[segment] || (root[segment] = {}));
        }
        
        root['_self'] = value;
    }
    
    function SetupPaths() {
        PATHS = {};
        TOC = {};
        var sources = Object.keys(SRD);
        for (var i = 0; i < sources.length; i++) {
            var sourceLookup = SRD[sources[i]].lookup;
            addToToc(sources[i], sourcePathFactory(MANIFEST[sources[i]]));
            if (sourceLookup) {
                var routes = Object.keys(sourceLookup);
                for (var j = 0; j < routes.length; j++) {
                    var value = articlePathFactory(sources[i], routes[j]);
                    addToPaths(sources[i] + '/' + routes[j], value);
                    addToToc(sources[i] + '/' + routes[j], value);
                }
            }
        }
        Object.keys(TEMPLATES)
            .forEach(function (key) {
                var entry = templatePathFactory(key)
                addToPaths(key, entry);
            })
    }
    
    function SetupTemplates() {
        TEMPLATES = {};
        Object.keys(MANIFEST)
            .map(function (key) {
                return {
                    key: key,
                    value: MANIFEST[key]
                }
            })
            .sort(function (a, b) {
                return a.value.priority - b.value.priority;
            })
            .forEach(function (source) {
                if (SRD[source.key]) {
                    if (SRD[source.key].template) {
                        Object.keys(SRD[source.key].template)
                            .forEach(function (key) {
                                var instance = (TEMPLATES[key] || (TEMPLATES[key] = {}));
                                instance.template = SRD[source.key].template[key];
                            });
                    }
                    if (SRD[source.key].data) {
                        Object.keys(SRD[source.key].data)
                            .forEach(function (key) {
                                var instance = (TEMPLATES[key] || (TEMPLATES[key] = {})),
                                    data = (instance.data || (instance.data = []));
                                instance.data = data.concat(SRD[source.key].data[key]);
                            });
                    }
                }
            });
    }

    /*
    Use this to do any final data munging
    */
    return function Setup(callback) {
        // create final path dictionary
        var activeSources = JSON.parse(localStorage.getItem('active-sources')) ||
            (function () {
                var startingSources = [];
                Object.keys(MANIFEST).forEach(function (key) {
                    if (MANIFEST[key].default || MANIFEST[key].required) {
                        startingSources.push(key);
                    }
                });
                localStorage.setItem('active-sources', JSON.stringify(startingSources));
                return startingSources;
            })();
        SRD = {};
        activeSources.reduce(function (callback, key) {
            return function () {
                if(SOURCE[key]) {
                    SOURCE[key]();
                    setTimeout(callback);
                } else {
                    offline.load('/srd/' + key + '.js', function (err, body) {
                        if (err) {
                            console.error(err);
                        } else {
                            eval(body);
                            SOURCE[key]();
                            callback();
                        }
                    })
                }
            }
        }, function done() {
            SetupTemplates();
            SetupPaths();
            setTimeout(callback);
        })();
    }
})();

