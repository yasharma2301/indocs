import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useStoreActions, useStoreState } from "easy-peasy";
import { motion } from "framer-motion";
import UploadIcon from "../assets/upload";
import { getMedia, resizeCanvas } from "../utils/camera-functions";

const Camera = (props) => {
  const canvasRef = useRef();
  const videoRef = useRef();
  const photoRef = useRef();
  const Refs = { canvasRef, videoRef, photoRef };

  const [init, setInit] = useState(false);
  const { images } = useStoreState((state) => state);
  const { addImage } = useStoreActions((action) => action);
  const [pop, setPop] = useState(false);

  const takeSnapshot = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const photo = photoRef.current;
    const context = canvas.getContext("2d");

    resizeCanvas(canvas, video);
    if (video.videoWidth)
      context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    // photo?.setAttribute("src", canvas.toDataURL("image/png"));

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      photo?.setAttribute("src", url);
      addImage({
        src: url,
        width: video.videoWidth,
        height: video.videoHeight,
      });
    });
    // photo?.setAttribute(
    //   "src",
    //   canvas.toBlob((blob) => blob)
    // );
    // addImage(canvas.toDataURL("image/png"));
    // addImage(canvas.toBlob((blob) => blob));
    setPop(true);
    setTimeout(() => {
      setPop(false);
    }, 500);
  };

  navigator.getMedia = navigator.getUserMedia;

  useEffect(() => {
    getMedia();

    if (images.length > 1 && !init) {
      photoRef.current.setAttribute("src", images[images.length - 1].src);
      setInit(true);
    }
  }, []);

  // class CustomImage extends Image {
  //   constructor() {
  //     super();
  //   }

  //   // `imageType` is a required input for generating a PDF for an image.
  //   get imageType() {
  //     return this.mimeType.split("/")[1];
  //   }
  // }

  // const getUploadedImg = (img) => {
  //   const canvas = canvasRef.current;
  //   const video = videoRef.current;
  //   const photo = photoRef.current;
  //   const context = canvas.getContext("2d");

  //   if (img) context.drawImage(img, 0, 0, canvas.width, canvas.height);
  //   // photo?.setAttribute("src", canvas.toDataURL("image/png"));
  //   // addImage(canvas.toDataURL("image/png"));
  // };

  // Each image is loaded and an object URL is created.
  const fileToImageURL = (file) => {
    return new Promise((resolve, reject) => {
      const photo = photoRef.current;
      const image = new Image(file.type);

      image.onload = () => {
        resolve(image);
      };

      image.onerror = () => {
        reject(new Error("Failed to convert File to Image"));
      };

      image.src = URL.createObjectURL(file);
      photo?.setAttribute("src", image.src);
      // addImage(image.src);
      // console.log(image.src);
    });
  };

  const handleImageUpload = (e) => {
    const fileList = e.target.files;
    const fileArray = fileList ? Array.from(fileList) : [];

    // Uploaded images are read and the app state is updated.
    const fileToImagePromises = fileArray.map(fileToImageURL);
    Promise.all(fileToImagePromises).then((res) => {
      // console.log(res[0].src);
      res.map((image) =>
        addImage({
          src: image.src,
          width: image.naturalWidth,
          height: image.naturalHeight,
        })
      );
    });
  };

  return (
    <>
      <motion.div key="wrapper" className="wrapper">
        <div className="mt-10">
          <video
            id="video"
            ref={videoRef}
            autoPlay
            style={{ display: "inline-block", verticalAlign: "top" }}
          ></video>
        </div>
        <div className="w-full flex justify-between items-center mt-5 h-20 px-2 overflow-visible">
          {/* <div className="w-3/5"></div> */}
          <div className="w-14">
            <label>
              <UploadIcon />
              <input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                // Native file input is hidden only for styling purposes
                style={{ display: "none" }}
                multiple
              />
            </label>
          </div>
          <motion.button
            initial={{ padding: "2rem" }}
            animate={{
              padding: init ? "0.5rem" : "2rem",
            }}
            id="capture"
            className="text-gray-900 absolute left-0 right-0 mx-auto rounded-full w-16 h-16 border-black border-8 bg-white p-2 overflow-hidden"
            style={{
              boxShadow: "0 0 0 2px white",
            }}
            onClick={() => {
              setInit(true);
              takeSnapshot();
            }}
          >
            <motion.div
              className={`w-14 transform  ${
                init ? "-translate-x-3" : "-translate-x-7 -translate-y-3"
              } font-extrabold`}
            >
              {/* <div className={`w-14 transform  font-extrabold`}> */}
              {init ? images.length - 1 : "START"}
            </motion.div>
          </motion.button>
          {images.length > 0 && (
            <Link href="/gallery">
              {/* <Photo /> */}
              <motion.img
                layoutId="gallery"
                animate={{
                  scale: pop ? [1, 1.4, 1] : 1,
                }}
                transition={{
                  duration: 0.3,
                }}
                className={`w-16 h-[80%] max-w-xs max-h-xl ${
                  images.length > 1 && "border-2 border-gray-200"
                } p-1`}
                ref={photoRef}
              />
            </Link>
          )}
        </div>
        <canvas
          id="canvas"
          ref={canvasRef}
          style={{ display: "none" }}
        ></canvas>
      </motion.div>
    </>
  );
};

export default Camera;
