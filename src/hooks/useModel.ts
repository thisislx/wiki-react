import { useContext } from 'react'
import { Context } from '@/App'
import type { ModelKeys, Models } from '@/models'

export default <K extends ModelKeys = any>(key: K): Models[K] => {
 const values = useContext(Context)
 return values[key]
}