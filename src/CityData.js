import React from 'react';
import DataDisplay from './DataDisplay.js';

class CityData extends React.Component {
  render() {
    return (
      <div className="CityData">
        <header>
          {this.props.city}
        </header>
        <content>
          <DataDisplay city={this.props.city} />
        </content>
      </div>
    );
  }
}

export default CityData;
