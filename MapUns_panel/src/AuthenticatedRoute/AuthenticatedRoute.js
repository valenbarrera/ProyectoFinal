import React, { useEffect, useState } from "react";
import PropTypes from 'prop-types';
import auth from '../auth/';
import { withRouter } from "react-router";

const AuthenticatedRoute = (props) => {
  const { history, location, onCheck, component: InnerComponent } = props;
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loginCheck = () => {
      
      auth.isLoggedIn()
        .then((response) => {
          if (response) {
            if (onCheck) {
              const check = onCheck(response);
              if (check) {
                if (/^https?:\/\//i.test(check)) {
                  window.location.assign(check); 
                } else if (location.pathname !== check) {
                  history.push(check);
                }
              } else {
                setIsLoggedIn(true);
              }
            } else {
              setIsLoggedIn(true);
            }
          } else {
            if (location.pathname !== "/login") {
              history.push("/login");
            }
            setIsLoggedIn(false);
          }
        })
        .catch((error) => {
          if (location.pathname !== "/login") {
            history.push("/login");
          }
          setIsLoggedIn(false);
        });
    };

    loginCheck();
  }, [history, location.pathname, onCheck]);

  if (isLoggedIn && InnerComponent) {
    return <InnerComponent {...props} />;
  }
  return null;
};

AuthenticatedRoute.propTypes = {
  component: PropTypes.oneOfType([
    PropTypes.func.isRequired,
    PropTypes.object.isRequired
  ]),
  location: PropTypes.object,
  history: PropTypes.object,
  onCheck: PropTypes.func
};

export default withRouter(AuthenticatedRoute);