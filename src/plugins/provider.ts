import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

export default class Provider {
  private static instances: Map<string, AxiosInstance> = new Map();

  /**
   * Crea o devuelve una instancia Axios con la configuración indicada.
   * @param name Nombre de la instancia (ej: "auth", "user")
   * @param config Configuración opcional de Axios
   */
  static getInstance(name: string, config?: AxiosRequestConfig): AxiosInstance {
    if (!this.instances.has(name)) {
      const instance = axios.create({
        baseURL: config?.baseURL || process.env.API_URL || "",
        timeout: config?.timeout || 10000,
        headers: {
          "Content-Type": "application/json",
          ...(config?.headers || {}),
        },
      });

      // Interceptor de request
      instance.interceptors.request.use(
        (request) => {
          // Aquí puedes añadir un token si existe
          // const token = localStorage.getItem("token");
          // if (token) request.headers.Authorization = `Bearer ${token}`;
          return request;
        },
        (error) => Promise.reject(error)
      );

      // Interceptor de response
      instance.interceptors.response.use(
        (response) => response,
        (error) => {
          console.error(`[Axios Error - ${name}]`, error.response || error.message);
          return Promise.reject(error);
        }
      );

      this.instances.set(name, instance);
    }
    return this.instances.get(name)!;
  }
}
