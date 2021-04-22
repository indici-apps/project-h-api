// const functions = require('firebase-functions');
// const gcs = require('@google-cloud/storage');
// const spawn = require('child-process-promise').spawn;
// const mkdirp = require('mkdirp-promise');
// const path = require('path');
// const os = require('os');
// const fs = require('fs');

// exports.optimizeImages = functions.storage.object().onFinalize(({ data }) => {
//     // File and directory paths.
//     const filePath = data.name;
//     const tempLocalFile = path.join(os.tmpdir(), filePath);
//     const tempLocalDir = path.dirname(tempLocalFile);


//     // Exit if this is triggered on a file that is not an image.
//     if (!data.contentType.startsWith('image/')) {
//         console.log('This is not an image.');
//         return null;
//     }

//     // Exit if this is a move or deletion event.
//     if (data.resourceState === 'not_exists') {
//         console.log('This is a deletion event.');
//         return null;
//     }

//     // Exit if file exists but is not new and is only being triggered
//     // because of a metadata change.
//     if (data.resourceState === 'exists' && data.metageneration > 1) {
//         console.log('This is a metadata change event.');
//         return null;
//     }

//     // Cloud Storage files.
//     const bucket = gcs.bucket(data.bucket);
//     const file = bucket.file(filePath);

//     return file.getMetadata()
//         .then(([metadata]) => {
//             if (metadata.metadata && metadata.metadata.optimized) {
//                 return Promise.reject(new Error("Image has been already optimized"));
//             }
//             return Promise.resolve();
//         })
//         .then(() => mkdirp(tempLocalDir))
//         .then(() => file.download({ destination: tempLocalFile }))
//         .then(() => {
//             console.log('The file has been downloaded to', tempLocalFile);
//             // Generate a thumbnail using ImageMagick.
//             return spawn('convert', [tempLocalFile, '-strip', '-interlace', 'Plane', '-quality', '82', tempLocalFile]);
//         })
//         .then(() => {
//             console.log('Optimized image created at', tempLocalFile);
//             // Uploading the Optimized image.
//             return bucket.upload(tempLocalFile, {
//                 destination: file,
//                 metadata: {
//                     metadata: {
//                         optimized: true
//                     }
//                 }
//             });
//         })
//         .then(() => {
//             console.log('Optimized image uploaded to Storage at', file);
//             // Once the image has been uploaded delete the local files to free up disk space.
//             fs.unlinkSync(tempLocalFile);

//             // Get the Signed URLs for optimized image.
//             const config = {
//                 action: 'read',
//                 expires: '03-01-2500'
//             };
//             return file.getSignedUrl(config);
//         });
// });