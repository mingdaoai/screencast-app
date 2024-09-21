let mediaRecorder;
let recordedChunks = [];

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const preview = document.getElementById('preview');
const downloadLink = document.getElementById('downloadLink');
downloadLink.addEventListener('click', handleDownload);

function handleDownload() {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'screen-recording.webm';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 100);
}

function createDownloadLink() {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    downloadLink.href = url;
    downloadLink.download = 'screen-and-camera-recording.webm';
    downloadLink.style.display = 'block';
    downloadLink.textContent = 'Download Recording';
    recordedChunks = [];
}

startBtn.addEventListener('click', startRecording);
stopBtn.addEventListener('click', stopRecording);

async function startRecording() {
    const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    
    const cameraPreview = document.getElementById('cameraPreview');
    cameraPreview.srcObject = cameraStream;
    cameraPreview.play();

    const combinedStream = new MediaStream([
        ...displayStream.getTracks(),
        ...cameraStream.getVideoTracks(),
        ...cameraStream.getAudioTracks()
    ]);

    preview.srcObject = displayStream; // Keep the screen preview as is
    mediaRecorder = new MediaRecorder(combinedStream);

    mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
        }
    };

    mediaRecorder.onstop = createDownloadLink;

    mediaRecorder.start();
    startBtn.disabled = true;
    stopBtn.disabled = false;
}

function stopRecording() {
    mediaRecorder.stop();
    preview.srcObject.getTracks().forEach(track => track.stop());
    const cameraPreview = document.getElementById('cameraPreview');
    cameraPreview.srcObject.getTracks().forEach(track => track.stop());
    startBtn.disabled = false;
    stopBtn.disabled = true;
}