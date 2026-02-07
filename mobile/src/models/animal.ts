// Animal Model
export interface Animal {
  id: number;
  name: string;
  device_id: string;
  ear_tag?: string;
  species: string;
  lat: number;
  lng: number;
  status: 'IN' | 'OUT';
  battery_level: number;
  signal_strength: number;
  last_seen?: string;
}

export interface AnimalCreateRequest {
  name: string;
  device_id: string;
  ear_tag?: string;
  species: string;
}

export interface GPSUpdateRequest {
  device_id: string;
  lat: number;
  lng: number;
  battery?: number;
  signal?: number;
}

export interface GPSUpdateResponse {
  success: boolean;
  animal?: Animal;
  message?: string;
}

export interface AnimalListResponse {
  success: boolean;
  animals: Animal[];
}

export interface AnimalDetailResponse {
  success: boolean;
  animal: Animal;
}

