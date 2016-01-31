(function (ns, OFFLINE) {
    
    var OPTIONS = {
        '': {
            icon: 'search',
            label: 'Search'
        },
        '#/reference': {
            icon: 'books',
            label: 'Reference'
        },
        '#/policy': {
            icon: 'hammer2',
            label: 'Site Policy'
        },
        '#/guide': {
            icon: 'cog',
            label: 'Guide'
        }
    }
    
    ns.Menu = React.createClass({
        getInitialState: function () {
            var that = this;
            OFFLINE.onChange(function () {
                that.setState({connectivity: OFFLINE.CURRENT });
            });
            setTimeout(function () {
                that.setState({min: true});
            }, 500);
            return { min: false, connectivity: OFFLINE.CURRENT };
        },
        render: function () {
            
            var children = Object.keys(OPTIONS).map(function (route) {
                var classList = ['entry'];
                if ((route && location.hash.indexOf(route) === 0) || (location.hash === route)) {
                    classList.push('active');
                }
                return <a className={classList.join(' ')} href={route || '#'}>
                    <i className={"icon-" + OPTIONS[route].icon}></i>
                    <span className="label">{OPTIONS[route].label}</span>
                    <span className="fold"></span>
                </a>
            });
            
            var that = this;
            
            function updateCache() {
                OFFLINE.update(function () {
                    if (OFFLINE.CURRENT === OFFLINE.STATUS.UPDATEREADY) {
                        return location.reload();
                    } else {
                        that.setState({connectivity: OFFLINE.CURRENT });
                    }
                });
                that.setState({connectivity: OFFLINE.CURRENT });
            }
            
            var onclick = updateCache,
                icon = "icon-connection",
                label = '', 
                classList = ["entry"];
            
            switch (this.state.connectivity) {
                case OFFLINE.STATUS.PENDING:
                    onclick = function () {};
                    icon = "icon-spinner8";
                    label = "Pending";
                    break;
                case OFFLINE.STATUS.CACHED:
                case OFFLINE.STATUS.NOUPDATE:
                    classList.push("connected");
                    label = "Connected";
                    break;
                case OFFLINE.STATUS.ERROR:
                    classList.push("offline");
                    label = "Offline";
                    break;
                case OFFLINE.STATUS.UPDATEREADY:
                    classList.push("pending");
                    onclick = function () {
                        location.reload();
                    };
                    label = "Click to Update";
                    break;
            }
            
            
            children.push(<a 
                className={classList.join(" ")} 
                onClick={onclick}>
                    <i className={icon}></i>
                    <span className="label">{label}</span>
                </a>);          
            
            return <div className={"menu" + (this.state.min ? ' min':'')}>
                <h1 className="logo"><em>oa</em>SRD</h1>
                {children}
            </div>;
        }
    });
})(window.Components || (window.Components = {}), window.OFFLINE);