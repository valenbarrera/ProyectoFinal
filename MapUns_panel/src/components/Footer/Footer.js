import React, {Component} from 'react';

class Footer extends Component {
  render() {
    return (
      <footer className="app-footer">
        <span className="ml-auto"><a href="https://www.uns.edu.ar/">Universidad Nacional del Sur</a> &copy; {new Date().getFullYear()}</span>
      </footer>
    )
  }
}

export default Footer;
