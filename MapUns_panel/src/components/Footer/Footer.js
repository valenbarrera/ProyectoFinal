import React, {Component} from 'react';

class Footer extends Component {
  render() {
    return (
      <footer className="app-footer">
        <span className="ml-auto"><a href="http://paradigma.com.ar">Paradigma del Sur S.A.</a> &copy; {new Date().getFullYear()}</span>
      </footer>
    )
  }
}

export default Footer;
