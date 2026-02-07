import * as Location from 'expo-location';
import { Platform } from 'react-native';

export class LocationService {
  private static instance: LocationService;
  private watchId: string | null = null;
  private onLocationUpdate: ((lat: number, lng: number) => void) | null = null;

  private constructor() {}

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  async requestPermissions(): Promise<boolean> {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus !== 'granted') {
      return false;
    }

    if (Platform.OS === 'android') {
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== 'granted') {
        return false;
      }
    }

    return true;
  }

  async getCurrentLocation(): Promise<{ lat: number; lng: number } | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log('Location permission not granted');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  }

  startTracking(onUpdate: (lat: number, lng: number) => void): void {
    this.onLocationUpdate = onUpdate;

    this.requestPermissions().then((hasPermission) => {
      if (!hasPermission) {
        console.log('Cannot start location tracking - permission denied');
        return;
      }

      this.watchId = Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (location) => {
          if (this.onLocationUpdate) {
            this.onLocationUpdate(location.coords.latitude, location.coords.longitude);
          }
        }
      );
    });
  }

  stopTracking(): void {
    if (this.watchId) {
      this.watchId = null;
      this.onLocationUpdate = null;
    }
  }

  async getAddressFromCoords(lat: number, lng: number): Promise<string> {
    try {
      const [address] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (address) {
        return `${address.street || ''} ${address.city || ''} ${address.country || ''}`.trim();
      }
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  }
}

export default LocationService.getInstance();

