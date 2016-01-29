(function (ns) {
    ns.Policy = React.createClass({
        render: function () {
            var markup = {
                __html: DOCUMENTS['docs/site-policy']
            };
            return <article>
                <pre dangerouslySetInnerHTML={markup}/>
            </article>; 
        }
    });
})(window.State || (window.State = {}));