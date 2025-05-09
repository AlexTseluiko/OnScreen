export interface GeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
    altitude: number | null;
    accuracy: number;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  };
  timestamp: number;
}

export interface GeolocationError {
  code: number;
  message: string;
}

export interface GeolocationAPI {
  getCurrentPosition: (
    successCallback: (position: GeolocationPosition) => void,
    errorCallback: (error: GeolocationError) => void,
    options?: PositionOptions
  ) => void;
  watchPosition: (
    successCallback: (position: GeolocationPosition) => void,
    errorCallback: (error: GeolocationError) => void,
    options?: PositionOptions
  ) => number;
  clearWatch: (watchId: number) => void;
}
