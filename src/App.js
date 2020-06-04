import React, { Component } from 'react';
import Index from './pages/index';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

export default class App extends Component {

  
  render() {
    
    return (
      <Router>
        <Switch>
          
          <Route path="/">
            <Index />
          </Route>
          
        </Switch>
      </Router>
    )
  }
}
