import React from 'react'


export interface ABCProps {

}

type Model = React.FC<ABCProps>

const ABC: Model = ({ ...props }) => {

 return (
  <section>

  </section>
 )
}

export default React.memo<Model>(ABC)