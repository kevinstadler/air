import React from 'react';

// http://aqicn.org/faq/2013-09-09/revised-pm25-aqi-breakpoints/
const aqiThresholds = [0, 51, 101, 151, 201, 301, 401, 501];
const mugStart = [0, 12.1, 35.5, 55.6, 150.5, 250.5, 350.5, 500.1];

function aqiIndex(aqi) {
  return aqiThresholds.findIndex(threshold => aqi < threshold);
}

function aqiToMug(aqi) {
  const i = aqiIndex(aqi);
  const mug = mugStart[i-1] + (aqi - aqiThresholds[i-1]) * (mugStart[i]-0.1-mugStart[i-1]) / (aqiThresholds[i] - aqiThresholds[i-1]);
  return (Math.round(mug*10)/10);
}

// function mugToAqi(mug) {
// }

// const CmugStart = [0, 35.1, 75.1, 115.1, 150.1, 250.1, 350.1, 500.1];

// function mugToCAqi(mug) {
// }

class DataDisplay extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      status: 'retrieving data...',
      color: 'white',
      data: null
    }
  }

  componentDidMount() {
    fetch('//api.waqi.info/feed/' + this.props.city + '/?token=7ef04af09a2a93a67569a5c774a03c617e99103e')
      .then(response => response.json())
      .then(json => {
        if (json.status === 'ok') {
          const { data } = json;
          const mug = aqiToMug(data.iaqi.pm25.v);
          this.setState({ data: {
            mug: mug,
            aqicat: aqiIndex(data.iaqi.pm25.v),
            aqi25: data.iaqi.pm25.v,
            aqi10: data.iaqi.pm10.v,
            localTime: new Date(data.time.s),
            universalTime: new Date(data.time.s + data.time.tz),
          }});
        } else {
          throw new Error();
        }
      }).catch(error => this.setState({ status: 'failed to load data' }));
  }

  render() {
    const { data } = this.state;
    if (data) {
      return ( <div>
        {data.localTime.toLocaleTimeString()} local time<br />
        {data.mug} µg/m3<br />
        AQI: <span className={"aqi" + data.aqicat}>{data.aqi25}</span>
      </div>);
    } else {
      return this.state.status;
    }
  }
}

export default DataDisplay;
