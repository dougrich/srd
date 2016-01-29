(function (ns) {
    
    function getId(path) {
        var segments = path.split('/');
        for (var i = 0, root = P; i < segments.length; i++) {
            root = root[segments[i]];
        }
        return root;
    }
    
    ns.Article = React.createClass({
        render: function () {
            var path = Components.Router.getCurrentState().id
                segments = path.split('/'),
                articleToc = null;
            
            /*
                Construct breadcrumbs
            */
            var breadcrumbs = [<a className="breadcrumb" href="#/reference">Reference</a>],
                partialPath = [];
            for (var i = 0, root = P; i < segments.length - 1; i++) {
                partialPath.push(segments[i]);
                root = root[segments[i]];
                var title = '';
                if (root["_self"]) {
                    title = SRD[root["_self"]].title;
                } else {
                    title = makeTitle(segments[i]);
                }
                breadcrumbs.push(<a className="breadcrumb" href={'#/reference/' + partialPath.join('/')}>{title}</a>);
            }
            articleToc = root[segments[i]];
            
            /*
                Construct child pages
            */
            var childPages = Object.keys(articleToc)
                .filter(function (key) {
                    return key !== "_self";
                })
                .map(function (key) {
                    var title = null;
                    if (articleToc[key]["_self"]) {
                        // links to an article
                        title = SRD[articleToc[key]["_self"]].title;
                    } else {
                        title = makeTitle(key);
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

            /*
                Construct the body of the article
            */

            var bodyChildren = [];

            if (articleToc["_self"]) {
                var article = SRD[articleToc["_self"]].content;
            
                article = article.replace(/<link rel="import" href="([^"]+)">/gi, function (match, capture) {
                    var segments = capture.split('/');
                    for (var i = 0, root = P; i < segments.length && root != null; i++) {
                        root = root[segments[i]];
                    }
                    if (root && root["_self"] && SRD[root["_self"]]) {
                        return '<div class="import-container">' + SRD[root["_self"]].content + '</div>';
                    } else {
                        return '<div class="error">ERROR: MISSING ' + capture + '</div>';
                    }
                });
                
                var markup = {
                    __html: article
                };
                
                bodyChildren.push(<div dangerouslySetInnerHTML={markup}></div>)
                if (childPages.length > 0) {
                    bodyChildren.push(<h2>Related</h2>)
                }
            } else {
                
                // get the title for where we are
                var segments = path.split('/'),
                    title = segments[segments.length - 1];
                
                title = makeTitle(title);
                
                bodyChildren.push(<h1>{title}</h1>);
            }
            
            /*
                Return the final assembled article markup
            */
            return <article>
                <nav>
                    {breadcrumbs}
                </nav>
                {bodyChildren}
                {childPages}
            </article>
        }
    });
})(window.State || (window.State = {}));