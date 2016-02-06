(function (ns) {
    ns.Policy = React.createClass({
        render: function () {
            var licenses = [
                {
                    name: "Contributions",
                    body: DOCUMENTS['docs/CONTRIBUTIONS']
                },
                {
                    name: "Code",
                    link: 'https://srdhub.net',
                    body: DOCUMENTS['docs/LICENSE']
                },
                {
                    name: "IcoMoon",
                    link: 'https://icomoon.io/',
                    body: DOCUMENTS['docs/ICOMOON-LICENSE']
                },
                {
                    name: "React",
                    link: 'https://facebook.github.io/react/',
                    body: DOCUMENTS['docs/REACT-LICENSE']
                }
            ];
            var sources = Object.keys(MANIFEST).map(function (key) {
                var source = MANIFEST[key];
                licenses.push({
                    name: source.name,
                    link: source.url,
                    body: LEGAL.license[source.license]
                })
            });
            
            return <article className="policy">
                {licenses.map(function (license) {
                    var markup = {
                        __html: license.body
                    };
                    
                    var title = [
                        <h2>{license.name}</h2>
                    ];
                    
                    if (license.link) {
                        title.push(<a href={license.link}>Website</a>);
                    }
                    
                    return <div>
                        <div className="title">
                            {title}
                        </div>
                        <pre dangerouslySetInnerHTML={markup}></pre>
                    </div>
                })}
            </article>; 
        }
    });
})(window.State || (window.State = {}));