import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { Badge, Nav, NavItem, NavLink as RsNavLink } from 'reactstrap';
import classNames from 'classnames';
import Menues from '../Menues';
import SidebarMinimizer from './../SidebarMinimizer';

import auth from "../../auth";


class Sidebar extends Component {

  handleClick(e) {
    e.preventDefault();
    e.target.parentElement.classList.toggle('open');
  }

  activeRoute(routeName, props) {
    // return this.props.location.pathname.indexOf(routeName) > -1 ? 'nav-item nav-dropdown open' : 'nav-item nav-dropdown';
    return props.location.pathname.indexOf(routeName) > -1 ? 'nav-item nav-dropdown open' : 'nav-item nav-dropdown';

  }
  sidebarMinimize() {
    document.body.classList.toggle('sidebar-minimized');
  }

  brandMinimize() {
    document.body.classList.toggle('brand-minimized');
  }

  hideMobile() {
    document.body.classList.toggle('sidebar-mobile-show');
  }
  // todo Sidebar nav secondLevel
  // secondLevelActive(routeName) {
  //   return this.props.location.pathname.indexOf(routeName) > -1 ? "nav nav-second-level collapse in" : "nav nav-second-level collapse";
  // }


  render() {

    const props = this.props;
    const activeRoute = this.activeRoute;
    const handleClick = this.handleClick;

    // badge addon to NavItem
    const badge = (badge) => {
      if (badge) {
        const classes = classNames(badge.class);
        return (<Badge className={classes} color={badge.variant}>{badge.text}</Badge>)
      }
    };

    // simple wrapper for nav-title item
    const wrapper = item => { return (item.wrapper && item.wrapper.element ? (React.createElement(item.wrapper.element, item.wrapper.attributes, item.name)) : item.name) };

    // nav list section title
    const title = (title, key) => {
      const classes = classNames("nav-title", title.class);
      return (<li key={key} className={classes}>{wrapper(title)} </li>);
    };

    // nav list divider
    const divider = (divider, key) => (<li key={key} className="divider"></li>);

    // nav item with nav link
    const navItem = (item, key) => {
      const classes = classNames(item.class)
      const isExternal = (url) => {
        return url.substring(0, 4) === 'http' ? true : false
      }
      const variant = classNames("nav-link", item.variant ? `nav-link-${item.variant}` : "");
      if (item.component != undefined)
        return (
          <item.component key={key} nav={item}/>
        )
      else
        return (
          <NavItem key={key} className={classes} onClick={(event) => { this.hideMobile(); }}>
            {isExternal(item.url) ?
              <RsNavLink href={item.url} className={variant} active>
                <i className={item.icon}></i>{item.name}{badge(item.badge)}
              </RsNavLink>
              :
              <NavLink to={item.url} className={variant} activeClassName="active">
                <i className={item.icon}></i>{item.name}{badge(item.badge)}
              </NavLink>
            }
          </NavItem>
        )
    };

    // nav dropdown
    const navDropdown = (item, key) => {
      var list = navList(item.children);
      if (list.filter(x => x != "").length > 0)
        return (
          <li key={key} className={activeRoute(item.url, props)}>
            <a className="nav-link nav-dropdown-toggle" href="#" onClick={handleClick.bind(this)}><i className={item.icon}></i>{item.name}</a>
            <ul className="nav-dropdown-items">
              {navList(item.children)}
            </ul>
          </li>)
      else
        return ""
    };

    // nav link
    const navLink = (item, idx) =>
      item.title ? title(item, idx) :
        item.divider ? divider(item, idx) :
          item.children ? navDropdown(item, idx)
            : navItem(item, idx);

    // nav list
    const navList = (items) => {
      return items.map((item, index) => {
        if (item.permission == undefined)
          return navLink(item, index);
        else {
          if (!auth.hasPermission(item.permission)) { return ""; }
          else { return navLink(item, index); }
        }
      });
    };

    // sidebar-nav root
    return (
      <div className="sidebar">
        <nav className="sidebar-nav">
          <Nav>
            {navList(Menues.items)}
          </Nav>
        </nav>
        <SidebarMinimizer />
        <span className="author-brand mx-auto"><a href="http://paradigma.com.ar">Paradigma del Sur S.A.</a> &copy; {new Date().getFullYear()}</span>
      </div>
    )
  }
}

export default Sidebar;
