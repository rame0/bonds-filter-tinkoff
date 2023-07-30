import axios, { AxiosError } from 'axios'
import type { App } from 'vue'

const baseURL = '/api'
export const httpClient = axios.create({ baseURL })

export const useAxios = () => httpClient

export default (app: App<Element>) => {
  app.use(httpClient)
  httpClient.interceptors.response.use(
    (response) => {
      // Any status code that lie within the range of 2xx cause this function to trigger
      // Do something with response data
      return response
    },
    (error: AxiosError) => {
      const httpStatus = error?.response?.status
      const errorBody: { message: string; data: any } | any | undefined = error?.response?.data
      const errorMessage: string | undefined = errorBody?.message

      if (!errorMessage) return Promise.reject(error)

      return Promise.reject(error)
    }
  )
}
