import React from 'react';
import { Router, Route, Switch, Link, NavLink } from 'react-router-dom';
import createHistory from 'history/createBrowserHistory';

import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';

export const history = createHistory();

function AppRouter() {
    return(
        <Router history={history}>
            <div>
                <Switch>
                    <Route component={NotFoundPage} />
                </Switch>
            </div>
        </Router>
    );
}

export default AppRouter;