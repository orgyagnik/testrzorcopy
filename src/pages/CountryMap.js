import React from 'react';
import { VectorMap } from "@react-jvectormap/core";
import { worldMill } from "@react-jvectormap/world";
import PropTypes from 'prop-types';

const CountryMap = ({ mapColor }) => {
  return (
    <div style={{ width: '100%', height: '251px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}> {/* Updated styles for centering */}
      <VectorMap
        map={worldMill}
        containerClassName="map "
        backgroundColor="transparent"
        markerStyle={{
          initial: {
            fill: "#7152F3",
            r: 4,
          },
          hover: {
            fill: "#7152F3",
            cursor: 'pointer'
          }
        }}
        markersSelectable={true}
        markers={[
          // Your markers...
        ]}
        zoomOnScroll={false}
        zoomMax={12}
        zoomMin={1}
        zoomAnimate={true}
        zoomStep={1.5}
        regionStyle={{
          initial: {
            fill: mapColor || "#D0D5DD",
            fillOpacity: 1,
            stroke: "none",
            strokeWidth: 0,
            strokeOpacity: 0,
          },
          hover: {
            fillOpacity: 0.7,
            cursor: "pointer",
            fill: "#7152F3",
          },
          selected: {
            fill: "#7152F3",
          },
          selectedHover: {},
        }}
        regionLabelStyle={{
          initial: {
            fill: "#7152F3",
            fontWeight: 500,
            fontSize: "13px",
            stroke: "none",
          },
          hover: {
            fill: '#FFF'
          },
          selected: {},
          selectedHover: {},
        }}
      />
    </div>
  );
};

CountryMap.propTypes = {
  mapColor: PropTypes.string,
};

export default CountryMap;