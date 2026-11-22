import React, { useEffect, useState, useContext } from 'react';
import { SocialIcon } from 'react-social-icons';
import { ThemeContext } from 'styled-components';
import PropTypes from 'prop-types';
import endpoints from '../constants/endpoints';

const styles = {
  iconStyle: {
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10,
  },
};

function Social({ exclude = [] }) {
  const theme = useContext(ThemeContext);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(endpoints.social, {
      method: 'GET',
    })
      .then((res) => res.json())
      .then((res) => setData(res))
      .catch((err) => err);
  }, []);

  return (
    <div className="social">
      {data ? data.social
        .filter((social) => !exclude.includes(social.network))
        .map((social) => (
          <SocialIcon
            key={social.network}
            style={styles.iconStyle}
            url={social.href}
            network={social.network}
            bgColor={theme.socialIconBgColor}
            fgColor={theme.background}
            target="_blank"
            rel="noopener"
          />
        )) : null}
    </div>
  );
}

Social.propTypes = {
  exclude: PropTypes.arrayOf(PropTypes.string),
};

Social.defaultProps = {
  exclude: [],
};

export default Social;
