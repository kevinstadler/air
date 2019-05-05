import React from 'react';

// http://aqicn.org/faq/2013-09-09/revised-pm25-aqi-breakpoints/
const aqiThresholds = [0, 51, 101, 151, 201, 301, 401, 501];
const mugStart = [0, 12.1, 35.5, 55.6, 150.5, 250.5, 350.5, 500.1];
const CmugStart = [0, 35.1, 75.1, 115.1, 150.1, 250.1, 350.1, 500.1];

function linearIndex(thresholds, value) {
  return thresholds.findIndex(threshold => value < threshold);
}

function aqiIndex(aqi) {
  return aqiThresholds.findIndex(threshold => aqi < threshold);
}

function linearStepwiseMapping(fro, to, diff, value) {
  const i = linearIndex(fro, value);
  return to[i-1] + (value - fro[i-1]) * (to[i]-diff-to[i-1]) / (fro[i] - fro[i-1]);
}

function aqiToMug(aqi) {
  return (Math.round(linearStepwiseMapping(aqiThresholds, mugStart, 0.1, aqi)*10)/10);
}

function mugToAqi(mug) {
  return Math.round(linearStepwiseMapping(mugStart, aqiThresholds, 0, mug));
}

function mugToCAqi(mug) {
  return Math.round(linearStepwiseMapping(CmugStart, aqiThresholds, 0, mug));
}

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
    fetch('https://api.waqi.info/feed/' + this.props.city + '/?token=7ef04af09a2a93a67569a5c774a03c617e99103e')
      .then(response => response.json())
      .then(json => {
        if (json.status === 'ok') {
          const { data } = json;
          const mug = aqiToMug(data.iaqi.pm25.v);
          const caqi = mugToCAqi(mug);
          this.setState({ data: {
            mug: mug,
            aqi25: data.iaqi.pm25.v,
            aqicat: linearIndex(aqiThresholds, data.iaqi.pm25.v),
            caqi25: caqi,
            caqicat: linearIndex(aqiThresholds, caqi),
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
        PM2.5 concentration: {data.mug} µg/m<sup>3</sup><br />
        AQI: <span className={"aqi" + data.aqicat}>{data.aqi25}</span><br />
        (Chinese AQI: <span className={"aqi" + data.caqicat}>{data.caqi25}</span>)
      </div>);
    } else {
      return this.state.status;
    }
  }
}

export default DataDisplay;
