"use client"
import { useState } from "react"
import Webcam from "react-webcam"

export default function Video() {

    const [imageSrc, setImageSrc] = useState(null); 

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setImageSrc(reader.result);
            uploadImage(file);
        };
        if (file) {
            reader.readAsDataURL(file);
        }
    };

    const uploadImage = async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch('http://127.0.0.1:5000/yolo_predict', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success === false) {
                    console.error('Error al analizar la imagen');
                    return;
                }
                setImageSrc(result.image); // Asume que la API devuelve la URL de la imagen en el campo 'imageUrl'
                console.log('Resultado:', result);
            } else {
                console.error('Error al subir la imagen:', response.statusText);
            }
        } catch (error) {
            console.error('Error al subir la imagen:', error);
        }
    };

    const dataURLtoFile = (dataurl, filename) => {
        const arr = dataurl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    };

    return (
        <div className="flex flex-row items-center justify-center min-h-1/2 max-h-1/2 p-4">
            <div className="flex flex-wrap items-center justify-center w-full max-w-4xl space-x-4">
                <div className="w-1/4 md:w-1/4">
                    <Webcam 
                        audio={false} 
                        screenshotFormat="image/jpg"
                        className="w-full h-auto object-cover"
                        videoConstraints={{
                            width: 1280,
                            height: 720,
                        }}
                    >
                        {({ getScreenshot }) => (
                            <button 
                                className="mt-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                                onClick={() => {
                                    const imageSrc = getScreenshot();
                                    setImageSrc(imageSrc);
                                    const file = dataURLtoFile(imageSrc, 'captured.jpg');
                                    uploadImage(file);
                                }}
                            >
                                Capture
                            </button>
                        )}
                    </Webcam>
                </div>

                {imageSrc && (
                    <div className="w-1/4 md:w-1/4">
                        <img src={imageSrc} alt="Screenshot" className="w-full h-auto object-cover" />
                    </div>
                )}
            </div>
            <div className="w-1/4 md:w-1/4">
                <input 
                    type="file" 
                    accept="image/*" 
                    className="mt-4 p-2 bg-gray-200 text-black rounded"
                    onChange={handleImageUpload}
                />
            </div>
        </div>
    )
}