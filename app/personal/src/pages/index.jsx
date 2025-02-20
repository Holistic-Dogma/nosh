import { useEffect, useRef } from 'react'



const TheUnconquerable = () => {
  return (
    <div class="fader">
      <h3>The Unconquerable</h3>
      <p>welcome</p>
      <p>to the unconquerable pragma</p>
      <p>this is a test site</p>
      <p>where we demo things</p>
      <div style={{ float: 'left', backgroundColor: '#fff', width: 300, height: 200, marginTop: 33 }}><img src="public/edgewood.png" style={{ width: 300, height: 200}}  /></div>
    </div>
  )
}

const TheIndomitable = () => {
  return (
    <div class="fader" align="right">
    <h3>The Indomitable</h3>
      <p>this is the end of millenia</p>
      <p>the end of time</p>
      <p>come to me when you are hollow</p>
      <p>and i will knit your bones</p>
      <div style={{ float: 'right', backgroundColor: '#c9f1cd', width: 300, height: 200, marginTop: 33 }}><img src="public/edgewood.png" style={{ width: 300, height: 200 }}/></div>
    </div>
  )
}


export default function Home() {
  return (
    <div>
      <TheUnconquerable />
      <TheIndomitable />
      <TheUnconquerable />
      <TheIndomitable />
      <TheUnconquerable />
      <TheIndomitable />
      <TheUnconquerable />
      <TheIndomitable />
      <TheUnconquerable />
      <TheIndomitable />
      <TheUnconquerable />
      <TheIndomitable />
      <TheUnconquerable />
      <TheIndomitable />
      <TheUnconquerable />
      <TheIndomitable />
      
    </div>
  )

}