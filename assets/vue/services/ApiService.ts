import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

/**
 * Service de base pour les appels API
 */
export default class ApiService {
    private static api: AxiosInstance = axios.create({
        baseURL: '/api',
        headers: {
            'Content-Type': 'application/ld+json'
        },
    });

    /**
     * Configure l'intercepteur pour gérer les erreurs
     */
    public static configureInterceptors(): void {
        this.api.interceptors.response.use(
            (response) => response,
            (error) => {
                // Log d'erreur pour le développement
                console.error('API Error:', error.response || error);

                // Possibilité d'ajouter un toast ou une notification ici

                return Promise.reject(error);
            }
        );
    }

    /**
     * Effectue une requête GET
     */
    public static async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.api.get<T>(url, config);
        return response.data;
    }

    /**
     * Effectue une requête POST
     */
    public static async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.api.post<T>(url, data, config);
        return response.data;
    }

    /**
     * Effectue une requête PUT
     */
    public static async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.api.put<T>(url, data, config);
        return response.data;
    }

    /**
     * Effectue une requête DELETE
     */
    public static async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.api.delete<T>(url, config);
        return response.data;
    }

    public static async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        // Merge les configurations existantes avec notre header spécifique pour PATCH
        const patchConfig = {
            ...config,
            headers: {
                ...config?.headers,
                'Content-Type': 'application/merge-patch+json'
            }
        };

        const response = await this.api.patch<T>(url, data, patchConfig);
        return response.data;
    }
}
