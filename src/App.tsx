import { useEffect, useRef, useState } from "react";
import CaptureImageComponent from "./CaptureImageComponent";
import PreviewComponent from "./PreviewComponent";
import axios from "axios";

export const dataURItoBlob = (dataURI: string): Blob => {
  const byteString = atob(dataURI.split(",")[1]);
  const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new File([new Blob([ab], { type: mimeString })], "image.jpeg", {
    type: "image/jpeg",
  });
};
function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showButtons, setShowButtons] = useState(false);
  const [count, setCount] = useState(0);
  const [formData] = useState(new FormData());
  const [image, setImage] = useState<string>("");
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((error) => {
        console.error(
          "Error accessing webcam plz throw your device in garbage :)",
          error
        );
      });
  }, [capturedImage, showButtons]);

  const handleCaptureClick = async () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);

      const capturedDataURL = canvas.toDataURL("image/jpeg");

      const capturedFile = dataURItoBlob(capturedDataURL);

      formData.append("input_image", capturedFile);

      // const response = await axios.get(ref, {
      //   responseType: "arraybuffer",
      // });

      // const imageBuffer = new Uint8Array(response.data);

      // const imageBlob = new Blob([imageBuffer], { type: "image/jpeg" });

      // const refFile = new File([imageBlob], "image.jpeg", {
      //   type: "image/jpeg",
      // });

      // formData.append("bg", refFile);

      setCapturedImage(capturedDataURL);
      setShowButtons(true);

      axios
        .post("https://ai-photobooth.cyclic.cloud/bg-changer", formData, {
        })
        .then((res) => {
          console.log(res.data);
          // const imageBlob = new Blob([res.data], { type: "image/jpeg" });
          // const imageRes = URL.createObjectURL(imageBlob);
          setImage(res.data.image);
        });
    }
  };
  const handleNextClick = () => {
    setCount((e) => e + 1);
  };

  const handleRetryClick = () => {
    setCapturedImage(null);
    setShowButtons(false);
    formData.delete("target_image");
    formData.delete("input_image");
  };
  return (
    <div className="w-full flex justify-center items-center flex-col p-2">
      <img
        src="https://www.gokapture.com/img/gokapture/favicon.png"
        alt="Logo"
      />
      {count === 0 && (
        <CaptureImageComponent
          capturedImage={capturedImage}
          handleCaptureClick={handleCaptureClick}
          handleNextClick={handleNextClick}
          handleRetryClick={handleRetryClick}
          showButtons={showButtons}
          videoRef={videoRef}
        />
      )}
      {count === 1 && <PreviewComponent image={image} />}
    </div>
  );
}

export default App;
