const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const uploadVideoToGofile = async (filePath) => {
    const url = 'https://store2.gofile.io/uploadFile';

    try {
        const form = new FormData();
        form.append('file', fs.createReadStream(filePath));

        const response = await axios.post(url, form, {
            headers: {
                ...form.getHeaders(),
            },
        });

        if (response.status && response.status === 200) {
            const data = response.data;
            console.log("Full response:");
            console.log(data);

            if (data.status === 'ok') {
                const file_id = data.data.id;
                const file_name = data.data.name;
                const download_link = `https://store2.gofile.io/download/web/${file_id}/${file_name}`;
                console.log(`File uploaded successfully! Public link: ${download_link}`);
            } else {
                console.log('Error in response:', data);
            }
        } else {
            console.error(`Failed to upload file. Status code: ${response.status}`);
        }
    } catch (error) {
        console.error('Error uploading file:', error);
    }
};

// Replace 'your_video_file.mp4' with the path to your video file
const videoFilePath = '/path/to/your/file.mp4';

uploadVideoToGofile(videoFilePath);