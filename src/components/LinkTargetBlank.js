import React from 'react';

function LinkTargetBlank({ url, title }) {
  return (
    <a href={url} target="_blank">{title}</a>
  );
}

export default LinkTargetBlank;