(function (ns) {

    
    ns.Guide = React.createClass({
        applyChanges: function () {
            var currentlySelectedSrcs = [], that = this;
            Object.keys(MANIFEST).forEach(function (key) {
                if (that.refs[key].checked || MANIFEST[key].required) {
                    currentlySelectedSrcs.push(key);
                }
            });
            localStorage.setItem('active-sources', JSON.stringify(currentlySelectedSrcs));
            CleanSlate();
            document.getElementById('loading-screen').className = 'overlay';
            var start = Date.now();
            Setup(function () {
                var wait = 750 - Date.now() + start;
                if (wait > 0) {
                    setTimeout(function () {
                        document.getElementById('loading-screen').className = 'hidden';
                    }, wait);
                } else {
                    document.getElementById('loading-screen').className = 'hidden';
                }
            });
        },
        componentDidMount: function () {
            var currentlySelectedSrcs = JSON.parse(localStorage.getItem('active-sources')), that = this;
            Object.keys(MANIFEST).forEach(function (key) {
                if (MANIFEST[key].required || currentlySelectedSrcs.indexOf(key) >= 0) {
                    that.refs[key].checked = true;
                }
            });
        },
        render: function () {
            var markup = {
                __html: DOCUMENTS['docs/guide']
            };
            var that = this;
            var currentlySelectedSrcs = JSON.parse(localStorage.getItem('active-sources'));
            var sourceSelection = Object.keys(MANIFEST).map(function (key) {
                var src = MANIFEST[key];
                if (src.required) {
                    return <div className="field">
                        <input type="checkbox" ref={key} checked="checked" readonly="readonly"/>
                        <strong>{src.name}</strong>
                    </div>
                } else {
                    return <div className="field">
                        <input type="checkbox" ref={key}/>
                        {src.name}
                    </div>;
                }
            });
            return <article>
                <h1>Settings</h1>
                <div className="source-list">
                    <h3>Sources</h3>
                    {sourceSelection}
                    <button onClick={this.applyChanges}>Apply</button>
                </div>
                <div dangerouslySetInnerHTML={markup}/>
            </article>; 
        }
    });
})(window.State || (window.State = {}));