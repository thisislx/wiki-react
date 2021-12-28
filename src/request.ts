import axios from "axios";
import { message } from 'antd'

const instance = axios.create()

instance.interceptors.response.use(
 (response) => {
  const data = response.data
  const { success, message: msg } = data

  msg && message[success ? 'info' : 'error'](msg)
  
  return data.data
 }
)

export default instance