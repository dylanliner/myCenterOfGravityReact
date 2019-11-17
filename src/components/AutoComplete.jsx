import React from 'react';
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from 'react-places-autocomplete';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import PropTypes from 'prop-types';

function AutoComplete({ onAddressSelected }) {
  const [address, setAddress] = React.useState('');
  const googleScript = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_MAPS_JS_API_KEY}&libraries=places`;

  const handleChangeAddress = e => {
    setAddress(e);
  };

  const handleSelect = e => {
    setAddress(e);
    geocodeByAddress(e)
      .then(results => getLatLng(results[0]))
      .then(latLng => {
        console.log('Success', latLng);
        onAddressSelected(latLng);
      })
      .catch(error => console.error('Error', error));
  };

  return (
    <div>
      <PlacesAutocomplete
        value={address}
        onChange={handleChangeAddress}
        onSelect={handleSelect}
      >
        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
          <div>
            <InputGroup className="mb-3">
              <InputGroup.Prepend>
                <InputGroup.Text id="basic-addon1">City</InputGroup.Text>
              </InputGroup.Prepend>
              <FormControl
                {...getInputProps({
                  placeholder: 'Search Places ...',
                  className: 'location-search-input',
                })}
              />
            </InputGroup>
            <div className="autocomplete-dropdown-container">
              {loading && <div>Loading...</div>}
              {suggestions.map(suggestion => {
                const className = suggestion.active
                  ? 'suggestion-item--active'
                  : 'suggestion-item';
                // inline style for demonstration purpose
                const style = suggestion.active
                  ? { backgroundColor: '#fafafa', cursor: 'pointer' }
                  : { backgroundColor: '#ffffff', cursor: 'pointer' };
                return (
                  <div
                    {...getSuggestionItemProps(suggestion, {
                      className,
                      style,
                    })}
                  >
                    <span>{suggestion.description}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </PlacesAutocomplete>
      <script src={googleScript} />
    </div>
  );
}

export default AutoComplete;

AutoComplete.propTypes = {
  onAddressSelected: PropTypes.func.isRequired,
};
