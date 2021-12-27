import axios from "axios";
import { message } from 'antd'

const instance = axios.create()

instance.interceptors.response.use(
 (response) => {
  (response as any).message ?? message.info(message);
  return response.data
 }
)

export default instance