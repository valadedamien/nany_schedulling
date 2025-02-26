export interface TimeSlotModel {
    id: number;
    name: string;
    dropOffTime: string; // Format: HH:MM
    pickUpTime: string; // Format: HH:MM
    color: string; // Format: #RRGGBB
}

export interface TimeSlotInputModel {
    name: string;
    dropOffTime: string; // Format: HH:MM
    pickUpTime: string; // Format: HH:MM
    color: string; // Format: #RRGGBB
}

export interface ApiTimeSlotModel {
    '@id': string;
    '@type': string;
    id: number;
    name: string;
    drop_off_time: string; // Format ISO
    pick_up_time: string; // Format ISO
    color: string;
}
