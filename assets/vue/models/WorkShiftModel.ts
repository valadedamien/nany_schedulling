export interface WorkShiftModel {
    id: number;
    name: string;
    color: string; // Format: #RRGGBB
    icon: string | null;
}

export interface WorkShiftInputModel {
    name: string;
    color: string; // Format: #RRGGBB
    icon: string | null;
}

export interface ApiWorkShiftModel {
    '@id': string;
    '@type': string;
    id: number;
    name: string;
    color: string;
    icon: string | null;
}
