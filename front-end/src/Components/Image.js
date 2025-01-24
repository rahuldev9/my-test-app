import React, { useEffect, useState } from 'react';

function Image() {
    const [image, setImage] = useState(null);
    const [uploadedImages, setUploadedImages] = useState([]);
    const user = JSON.parse(localStorage.getItem('user'));
    useEffect(() => {
        fetchImages(); // Fetch images when component mounts
    }, []);
    // Convert image to base64
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setImage(reader.result);
        };
        if (file) {
            reader.readAsDataURL(file);
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('https://my-test-app-api.onrender.com/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    data: image,
                    email:user.email, // Send email with the request
                }),
            });

            const result = await response.json();
            if (response.ok) {
                alert(result.message);
                fetchImages(); // Refresh images after successful upload
            } else {
                alert('Failed to upload image: ' + result.message);
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred while uploading the image.');
        }
    };

    // Fetch images
    const fetchImages = async () => {

        try {
            const response = await fetch(`https://my-test-app-api.onrender.com/images?email=${user.email}`);
            if (response.ok) {
                const data = await response.json();
                setUploadedImages(data);
            } else {
                alert('Failed to fetch images.');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred while fetching images.');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Image Upload to MongoDB</h1>
            <form onSubmit={handleSubmit}>
                <input type="file" accept="image/*" onChange={handleImageChange} />
                <button type="submit">Upload</button>
            </form>

            <button onClick={fetchImages} style={{ marginTop: '20px' }}>Fetch Uploaded Images</button>

            <div style={{ marginTop: '20px' }}>
                {uploadedImages.map((img, index) => (
                    <div key={index} style={{ marginBottom: '20px' }}>
                        <img src={img.data} alt="Uploaded" style={{ maxWidth: '300px' }} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Image;
