(function (ns) {
    var VIEWS = {
        'Quick Reference': 0,
        'Table of Contents': 1,
        'Alphabetical': 2,
        'Glossary': 3
    };
    
    ns.Reference = React.createClass({
        getInitialState: function () {
            return { view: VIEWS['Table of Contents'] }
        },
        render: function () {
            // filter
            var children = [];
            if (this.state.view === VIEWS['Alphabetical']) {
                var entries = {};
                Object.keys(SRD)
                    .filter(function (key) {
                        return key !== 'EMPTY';
                    })
                    .map(function (key) {
                        var article = SRD[key];
                        return {
                            title: article.title,
                            entry: <div><a href={"#/reference/" + article.path}>{article.title}</a></div>
                        }
                    })
                    .sort(function (a, b) {
                        if (a.title) return a.title.localeCompare(b.title);
                        else return 0;
                    })
                    .forEach(function (e) {
                        if (e.title) {
                            var firstLetter = e.title[0].toUpperCase();
                            (entries[firstLetter] || (entries[firstLetter] = [])).push(e.entry);
                        }
                    });
                var subChildren = Object.keys(entries).map(function (key) {
                    var grouping = entries[key];
                    return <div className="grouping">
                        <h3>{key}</h3>
                        <div className="links">{grouping}</div>
                    </div>;
                });
                
                children.push(<div className="view alphabetical">{subChildren}</div>);
            } else if (this.state.view === VIEWS['Glossary']) {
                // create the glossary list
                var groupings = {};
                Object.keys(PD).forEach(function (key) {
                    var markup = <div className="term">
                        <h5>{key}</h5>
                        <div className="links">
                            {PD[key].map(function (link) {
                                var fragment = SRD[link];
                                return <a href={"#/reference/" + fragment.path}>{fragment.title}</a>;
                            })}
                        </div>
                    </div>;
                    (groupings[key[0]] || (groupings[key[0]] = [])).push(markup);
                });
                
                children.push(<div className="view glossary">
                    {Object.keys(groupings).sort(function (a,b) {
                        return a.localeCompare(b)
                    }).map(function (letter) {
                        return <div className="grouping">
                            <h3>{letter}</h3>
                            {groupings[letter]}
                        </div>
                    })}
                </div>);
            } else if (this.state.view === VIEWS['Table of Contents']) {
                // cover the whole P object
                var toc = (function list(path, root) {
                    return <ul>
                    {Object.keys(root)
                    .filter(function (key) {
                        return key !== "_self";
                    })
                    .map(function (key) {
                        var title = makeTitle(key);
                        if (root[key]["_self"]) {
                            title = SRD[root[key]["_self"]].title;
                        }
                        return {
                            title: title,
                            path: path + '/' + key,
                            root: root[key]
                        };
                    }).sort(function (a, b) {
                        return a.title.localeCompare(b.title);
                    }).map(function (kv) {
                        return <li>
                            <a href={kv.path}>{kv.title}</a>
                            {list(kv.path, kv.root)}
                        </li>
                    })}</ul>;
                })('#/reference', P);
                children.push(<div className="toc">
                    {toc}
                </div>);
            }
            
            var that = this;
            function viewFactory(view) {
                return function () {
                    that.setState({view: view});
                }
            }
            
            return <section>
                <h1>Reference</h1>
                <div className="views">
                    <div className={"option" + (this.state.view === VIEWS['Table of Contents'] ? ' active' : '')} onClick={viewFactory(VIEWS['Table of Contents'])}>Table of Contents</div>
                    <div className={"option" + (this.state.view === VIEWS['Alphabetical'] ? ' active' : '')} onClick={viewFactory(VIEWS['Alphabetical'])}>Articles</div>
                    <div className={"option" + (this.state.view === VIEWS['Glossary'] ? ' active' : '')} onClick={viewFactory(VIEWS['Glossary'])}>Glossary</div>
                </div>
                {children}
            </section>;
        }
    });
})(window.State || (window.State = {}));