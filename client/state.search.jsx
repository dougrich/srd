(function (ns) {
    
    function findNearest(key, count) {
        key = key
            .toLowerCase()
            .trim()
            .replace(/^(the|a|an|it|of)\W/gi, '');
        var descent = [I.key], foundDict = {};
        var phrase = '';
        // descend first
        for (var i = 0; i < key.length; i++) {
            if (!descent[descent.length - 1][key[i]]) {
                break;
            } else {
                descent.push(descent[descent.length - 1][key[i]]);
                phrase += key[i];
            }
        }
        
        var next = [{
            phrase: phrase,
            node: descent.pop()
        }];
        // execute a breadth-first search away from our current node
        while (next.length && Object.keys(foundDict).length < count) {
            var nextNext = [];
            while (next.length && Object.keys(foundDict).length < count) {
                var root = next.pop();
                if (root.node['_self']) {
                    foundDict[root.phrase] = root.node['_self'];
                }
                var letters = Object.keys(root.node);
                for (var i = 0; i < letters.length; i++) {
                    if (letters[i] === '_self') continue;
                    if (descent.indexOf(root.node[letters[i]]) !== -1) continue;
                    nextNext.push({
                        phrase: root.phrase + letters[i],
                        node: root.node[letters[i]]
                    });
                }
            }
            next = nextNext;
        }
        
        return foundDict;
    }
    
    ns.Search = React.createClass({
        getInitialState: function () {
            return { results: {} };
        },
        onKeyUp: function () {
            // find the nearest 5 and log to console
            if (this.refs.searchBar.value.length >= 2) {
                this.setState({ results: findNearest(this.refs.searchBar.value, 5) });
            } else if (this.state.results !== {}) {
                this.setState({ results: {} });
            }
        },
        render: function () {
            var children = [],
                autoComplete = Object.keys(this.state.results);
            if (autoComplete.length !== 0) {
                var results = this.state.results;
                children = autoComplete.map(function (key) {
                    
                    return <div>
                        <h3>{key}</h3>
                        <div className="links">
                        {results[key].map(function (article) {
                            return <a href={'#/reference/' + SRD[article].path}>{SRD[article].title}</a>;
                        })}
                        </div>
                    </div>;
                });
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