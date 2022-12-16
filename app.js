const createStore = (reducer) => {
    let state = reducer(undefined, { type: '__INIT__' });
    let subscribers = [];

    return {
        getState: () => state,
        dispatch: action => { 
            state = reducer(state, action);
            subscribers.forEach(cb => cb());
        },
        subscribe: (cb) => subscribers.push(cb),
    };
};

const initialState = {
    count: 0,
};

const INCREMENT = 'INCREMENT';

const increment = count => ({
    type: INCREMENT,
    payload: count,
});

const countReducer = (state = initialState, action) => {
    switch (action.type) {
        case INCREMENT:
            return {
                ...state,
                count: state.count + action.payload,
            };
        
        case 'DECREMENT':
            return {
                ...state,
                count: state.count - action.payload,
            };

        default:
            return {
                ...state,
            };
    }
};

const initialUSerState = {
    users: [],
};

const userReducer = (state = initialUSerState, action) => {
    switch (action.type) {
        case 'SUCCESS':
            return {
                ...state,
                users: action.payload,
            };

        default:
            return {
                ...state,
            };
    }
};

// const reducer = (state, action) => {
//     return {
//         userState: userReducer(state.userState, action),
//         countState: countReducer(state.countState, action),
//     };
// };

const combineRedcuers = (reducersMap) => {
    return (state, action) => {
        const nextState = {};

        Object.entries(reducersMap).forEach(([key, reducer]) => {
            nextState[key] = reducer(state ? state[key] : state, action);
        });

        return nextState;
    };
};

const rootReducer = combineRedcuers({ userState: userReducer, countState: countReducer });

// const store = createStore(rootReducer);

// console.log(store.getState());

// // store.subscribe(() => console.log('change'));

// store.dispatch(increment(3));
// store.dispatch({ type: 'DECREMENT', payload: 1 });
// store.dispatch({ type: 'SUCCESS', payload: [{ name: 'user' }] });

// console.log(store.getState());

const logger = store => dispatch => action => {
    console.log(action.type);
}

const thunk = store => dispatch => action => {
    if (typeof action === 'function') {
        return action(store.dispatch, store.getState);
    }

    return dispatch(action);
};

const applyMiddleware = (middleware) => {
    return (createStore) => {
        return (reducer) => {
            const store = createStore(reducer);
            return {
                dispatch: action => middleware(store)(store.dispatch)(action),
                getState: store.getState,
            }
        }
    }
};

const init = {
    isLoading: false,
}

const reducerNew = (state = init, action) => {
    switch (action.type) {
        case 'STARTED':
            return {
                ...state,
                isLoading: true,
            };

        case 'SUCCESS':
            return {
                ...state,
                isLoading: false,
            };

        default:
            return {
                ...state,
            }
    }
}

const someAction = () => {
    return async (dispatch) => {
        dispatch({ type: 'STARTED' });

        await new Promise(resolve => setTimeout(() => resolve(), 2000));

        dispatch({ type: 'SUCCESS' });
    }
}

const createStoreWithMiddleware = applyMiddleware(logger)(createStore);
const storeWithMiddle = createStoreWithMiddleware(reducerNew);

console.log(storeWithMiddle.getState());

storeWithMiddle.dispatch({ type: 'SUCCESS' });

console.log(storeWithMiddle.getState());

setTimeout(() => {
    console.log(storeWithMiddle.getState());
}, 5000);

