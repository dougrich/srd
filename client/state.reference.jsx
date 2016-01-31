(function (ns) {
    var VIEWS = {
        'Quick Reference': 0,
        'Table of Contents': 1,
        'Articles': 2,
        'Glossary': 3,
        'Tables': 4
    };
    
    function makePresentable(key) {
        return key
            .replace(/(?:^|\-)[a-z]/gi, function (x) {
                return ' ' + x[x.length - 1].toUpperCase();
            })
            .trim();
    }
    
    function renderToc(prefixes, root) {
        if (root) {
            return <ul>
                {Object.keys(root)
                .filter(function (key) {
                    return key !== '_self';
                })
                .map(function (key) {
                    var title = null,
                        href = '#/reference/' + prefixes.join('/') + '/' + key;
                    if (root[key]._self) {
                        title = root[key]._self.title;
                    } else {
                        title = makePresentable(key);
                    }
                    return <li>
                        <a href={href}>{title}</a>
                        {renderToc(prefixes.concat(key), root[key])}
                    </li>;
                })}
            </ul>;
        } else {
            return [];
        }
    }
    
    function renderRootToc() {
        // go grab each of the sources, ordered by priority
        var sources = Object.keys(MANIFEST)
            .map(function (key) {
                return {
                    key: key,
                    value: MANIFEST[key]
                }
            })
            .filter(function (source) {
                return !!TOC[source.key];
            })
            .sort(function (a, b) {
                return a.value.priority - b.value.priority;
            })
            .map(function (source) {
                return <li>
                    <h3><a href={"#/reference/" + source.key}>{source.value.name}</a></h3>
                    {renderToc([source.key], TOC[source.key])}
                </li>;
            });
        return <div className="toc"><ul>{sources}</ul></div>;
    }
    
    function renderTables() {
        // example of dynamically created table
        return <div className="toc">
            <ul>
                <li>
                    <h3>Tables</h3>
                    <ul>
                    {Object.keys(TEMPLATES)
                        .map(function (key) {
                            var title = TEMPLATES[key].template.prototype.title || makePresentable(key);
                            return <li><a href={"#/reference/" + key}>{title}</a></li>
                        })}
                    </ul>
                </li>
            </ul>
        </div>
    }
    
    ns.Reference = React.createClass({
        getInitialState: function () {
            return { view: VIEWS['Table of Contents'] }
        },
        render: function () {
            // filter
            var children = [];
            switch (this.state.view) {
                case VIEWS['Tables']:
                    children.push(renderTables());
                    break;
                case VIEWS['Articles']:
                    break;
                case VIEWS['Glossary']:
                    break;
                case VIEWS['Table of Contents']:
                    children.push(renderRootToc());
                    break;
            }
            
            var that = this;
            function viewFactory(view) {
                return <div 
                    className={"option" + (that.state.view === VIEWS[view] ? ' active' : '')}
                    onClick={function () {
                        that.setState({view: VIEWS[view]});
                    }}>
                    {view}
                </div>;
            }
            
            return <section>
                <h1>Reference</h1>
                <div className="views">
                    {viewFactory('Table of Contents')}
                    {viewFactory('Tables')}
                    {viewFactory('Glossary')}
                </div>
                {children}
            </section>;
        }
    });
})(window.State || (window.State = {}));