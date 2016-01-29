(function (ns) {
    var States = {
        '': {
            state: 'Search' 
        },
        '#/policy': {
            state: 'Policy'
        },
        '#/reference': {
            state: 'Reference'
        },
        '#/guide': {
            state: 'Guide'
        },
        '#/reference/:id': {
            state: 'Article',
            isValid: function (name, value) {
                var segments = value.split('/');
                for (var i = 0, root = P; i < segments.length; i++) {
                    if (!root[segments[i]]) {
                        return false;
                    } else {
                        root = root[segments[i]];
                    }
                }
                return true;
            }
        }
    };
    
    ns.Router = {
        getCurrentState: function() {
            // first, lowercase the hash
            var hash = location.hash.toLowerCase();
            // next, check if it matches any of the states; if not, use the default
            for (state in States) {
                if (state === hash) {
                    return {
                        hash: hash,
                        state: States[state].state
                    }
                } else if (state.indexOf(':') >= 0) {
                    var starts = state.substr(0, state.indexOf(':')),
                        variableName = state.substr(state.indexOf(':') + 1);
                    if (hash.indexOf(starts) === 0) {
                        var variableValue = hash.replace(starts, '');
                        if (States[state].isValid && States[state].isValid(variableName, variableValue)) {
                            var retVal = {
                                hash: hash,
                                state: States[state].state
                            };
                            retVal[variableName] = variableValue;
                            return retVal;
                        }
                    }
                }
            }
            return {
                hash: '',
                state: States[''].state
            };
        },
        ensureState: function () {
            var hash = ns.Router.getCurrentState().hash;
            if (hash !== location.hash) {
                location.hash = hash;
                return false;
            } else {
                return true;
            }
        }
    }
})(window.Components || (window.Components = {}));