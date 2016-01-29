var App = React.createClass({
    getInitialState: function () {
        return { currentState: Components.Router.getCurrentState().state };
    },
    componentDidMount: function () {
        var that = this;
        window.onhashchange = function () {
            if (Components.Router.ensureState()) {
                that.setState({
                    currentState: Components.Router.getCurrentState().state
                });
            }
        }
    },
    render: function () {
        var children = [React.createElement(Components.Menu)];
        children.push(React.createElement(State[this.state.currentState]));
        
        return React.createElement('div', {}, children);
    }
});
    
function makeTitle(segment) {
    var words = segment.split(/[\-\.]/gi);
    return words.map(function (word) {
        return word[0].toUpperCase() + word.substring(1)
    }).join(' ');
}