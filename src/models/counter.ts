import { useState } from 'react'


export default () => {
 const [counter, setCounter] = useState(1)
 return {
  counter,
  setCounter,
 }
}