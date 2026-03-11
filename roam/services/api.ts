import axios from 'axios'
import { Config } from '../constants/config'

export const apiClient = axios.create({
  baseURL: Config.API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})
