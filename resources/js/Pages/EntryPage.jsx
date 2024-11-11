import Webcam from "react-webcam";
import {useRef} from "react";

import PrimaryButton from "@/Components/PrimaryButton";

export default function VideoCamera() {
    const webRef = useRef(null);
    let img = "null";
    const showImage = () =>{
        img = webRef.current.getScreenshot();
    }

    return (
        <>
        <Webcam ref={webRef}/>
        <PrimaryButton onclick={()=>{
            showImage()
        }}>click</PrimaryButton>
        </>
    )
};