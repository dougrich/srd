(function (ns) {
        
    function makePresentable(key) {
        return key
            .replace(/(?:^|\-)[a-z]/gi, function (x) {
                return ' ' + x[x.length - 1].toUpperCase();
            })
            .trim();
    }
    
    ns.Article = React.createClass({
        componentDidMount: function () {
            var native = ReactDOM.findDOMNode(this);
            var embedded = native.querySelectorAll('[data-template]');
            for (var i = 0; i < embedded.length; i++) {
                
                var embed = embedded[i],
                    templateName = embed.attributes['data-template'].value;
                TEMPLATES[templateName].template
                
                ReactDOM.render(
                    React.createElement(
                        TEMPLATES[templateName].template,
                        {
                            data: TEMPLATES[templateName].data || [] 
                        }), 
                        embed);
            }
        },
        render: function () {
            var path = Components.Router.getCurrentState().id
                segments = path.split('/'),
                articleToc = null;
            
            var sources = [];
            /*
                Construct breadcrumbs
            */
            var breadcrumbs = [<a className="breadcrumb" href="#/reference">Reference</a>],
                partialPath = [];
            for (var i = 0, root = TOC; i < segments.length - 1; i++) {
                partialPath.push(segments[i]);
                root = root[segments[i]];
                var title = '';
                if (root._self) {
                    title = root._self.title;
                } else {
                    title = makePresentable(segments[i]);
                }
                breadcrumbs.push(<a className="breadcrumb" href={'#/reference/' + partialPath.join('/')}>{title}</a>);
            }
            articleToc = root[segments[i]];
            
            // add source
            if (SRD[segments[0]]) {
                sources.push(segments[0]);
            }
            
            /*
                Construct child pages
            */
            var childPages = [];
            if (articleToc) {
                childPages = Object.keys(articleToc)
                    .filter(function (key) {
                        return key !== "_self";
                    })
                    .map(function (key) {
                        var title = null;
                        if (articleToc[key]._self) {
                            // links to an article
                            title = articleToc[key]._self.title;
                        } else {
                            title = makePresentable(key);
                        }
                        
                        return {
                            title: title,
                            path: '#/reference/' + path + '/' + key
                        }
                    })
                    .sort(function (a, b) {
                        return (a.title || '').localeCompare(b.title);
                    })
                    .map(function (kv) {
                        return <div><a href={kv.path}>{kv.title}</a></div>;
                    });
                if (childPages.length > 0) {
                    childPages = [<h3>Related</h3>].concat(childPages);
                }
            }

            /*
                Construct the body of the article
            */

            var bodyChildren = [];

            if (PATHS[path]) {
                
                bodyChildren.push(PATHS[path].render())
                
            } else {
                
                // get the title for where we are
                var title = makePresentable(segments[segments.length - 1]);
                
                bodyChildren.push(<h1>{title}</h1>);
            }
                        
            /*
                Construct attributions
            */
            var attributions = sources
            .filter(function (v, i) {
                return sources.indexOf(v) === i;
            })
            .map(function (source) {
                var manifestInfo = MANIFEST[source];
                console.log(manifestInfo);
                return <a href={manifestInfo.url}>{manifestInfo.name}</a>;
            });
            
            /*
                Return the final assembled article markup
            */
            
            return <article>
                <nav>
                    {breadcrumbs}
                </nav>
                {bodyChildren}
                {childPages}
                <div className="attributions">
                    Content drawn from 
                    <span className="list">{attributions}</span>; see <a href="#/policy">policy</a> for licensing
                </div>
            </article>
        }
    });
})(window.State || (window.State = {}));