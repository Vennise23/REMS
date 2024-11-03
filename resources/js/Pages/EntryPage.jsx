import Webcam from "react-webcam";
import {useRef} from "react";

export default function VideoCamera() {
    const webRef = useRef(null);
    let img = "null";
    const showImage = () =>{
        img = webRef.current.getScreenshot();
    }

    return (
        <>
        <Webcam ref={webRef}/>
        <button onclick={()=>{
            showImage()
        }}>click</button>
        </>
    )
};