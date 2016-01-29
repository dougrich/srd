(function (ns) {
    ns.Guide = React.createClass({
        render: function () {
            var markup = {
                __html: DOCUMENTS['docs/guide']
            };
            return <article dangerouslySetInnerHTML={markup}/>; 
        }
    });
})(window.State || (window.State = {}));