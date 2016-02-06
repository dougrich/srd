(function (ns) {
    
    function autocomplete(word, count) {
        var root = INDEX.t,
            size = 1,
            originalWord = word;
        while(root && word.length && size <= word.length) {
            var key = word.substr(0, size);
            if (root[key]) {
                root = root[key];
                word = word.substring(size);
                size = 0;
            }
            size++;
        }
        
        if (!root) {
            // nothing found
            return [];
        }
        
        if (size === word.length + 1 && word) {
            // possible partial match
            var continues = Object.keys(root), found = false;
            for (var i = 0; i < continues.length && !found; i++) {
                if (continues[i].indexOf(word) === 0) {
                    root = root[continues[i]];
                    originalWord += continues[i].replace(word, '');
                    found = true;
                }
            }
            if (!found) {
                return [];
            }
        }
        
        var searchable = [],
            found = {};
            
        searchable.push({
            node: root,
            word: originalWord
        });
        while (searchable.length && Object.keys(found).length < count) {
            var next = searchable.pop();
            if (next.node.$) {
                // add to found
                next.node.$.forEach(function (i) {
                    if (Object.keys(found) === count) return;
                    var word = INDEX.w[i.w],
                        source = INDEX.s[i.s];
                    if (!SRD[source]) return;
                    (found[word] || (found[word] = [])).push({
                        source: source,
                        path: INDEX.p[i.p],
                        template: INDEX.p[i.t],
                        i: i.i,
                        j: i.j
                    })
                });
            }
            var children = Object.keys(next.node);
            for (var i = 0; i < children.length; i++) {
                if (children[i] === '$') continue;
                searchable.push({
                    word: next.word + children[i],
                    node: next.node[children[i]]
                });
            }
        }
        
        return found;
    }
    
    ns.Search = React.createClass({
        getInitialState: function () {
            return { term: null, results: {} };
        },
        onKeyUp: function () {
            // find the nearest 5 and log to console
            if (this.refs.searchBar.value.length >= 1) {
                this.setState({ 
                    term: this.refs.searchBar.value.toLowerCase(), 
                    results: autocomplete(this.refs.searchBar.value.toLowerCase(), 10) 
                });
            } else if (this.state.results !== {}) {
                this.setState({ term: null, results: {} });
            }
        },
        render: function () {
            var children = [],
                autoComplete = Object.keys(this.state.results);
            if (autoComplete.length !== 0) {
                var results = this.state.results,
                    term = this.state.term;
                children = autoComplete.map(function (key) {
                    var markedKey = {
                        __html: key.replace(term, '<em>' + term + '</em>')
                    };
                    
                    // pull out templated content
                    var templated = {};
                    return <div>
                        <h3 dangerouslySetInnerHTML={markedKey}></h3>
                        {results[key].map(function (find) {
                            if (find.template && !find.i) {
                                // entire template
                                return <a href={"#/reference/" + find.template}>{TEMPLATES[find.template].template.prototype.title}</a>
                            } else if (find.template) {
                                // go find the row in question
                                var datum = SRD[find.source].data[find.template][find.i - 1];
                                if (datum) {
                                    // template row
                                    var data = (templated[find.template] || (templated[find.template] = []));
                                    data.push(datum);
                                } else {
                                    // referencing the entire table
                                    return <a href={"#/reference/" + find.template}>{TEMPLATES[find.template].template.prototype.title}</a>
                                }
                            } else {
                                return <a href={"#/reference/" + find.source + "/" + find.path}>{SRD[find.source].articles[SRD[find.source].lookup[find.path]].title}</a>
                            }
                        })}
                        {Object.keys(templated).map(function (template) {
                            return <div className="table-container">
                            {React.createElement(
                                TEMPLATES[template].template,
                                {
                                    data: templated[template]
                                })}</div>;
                        })}
                    </div>;
                });
            } else if (this.state.term) {
                children.push(<em>No Results</em>);
            }
            return <div className="centered search">
                <div className="title">
                    <h1>SRD</h1>
                    <a href="#/guide">New?</a>
                </div>
                <input ref='searchBar' onKeyUp={this.onKeyUp} placeholder="Search" type="text"/>
                {children}
            </div>;
        }
    });
})(window.State || (window.State = {}));