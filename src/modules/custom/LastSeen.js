import React from 'react';
import TimeAgo from 'javascript-time-ago';
import ReactTimeAgo from 'react-time-ago';

import en from 'javascript-time-ago/locale/en.json';
import ru from 'javascript-time-ago/locale/ru.json';

TimeAgo.addDefaultLocale(en);
TimeAgo.addLocale(ru);

export default function LastSeen(props) {
  return (
    <ReactTimeAgo {...props} locale="en-US" tooltip={false} />
  );
}
