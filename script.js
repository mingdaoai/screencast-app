let screenRecorder, cameraRecorder;
let screenChunks = [], cameraChunks = [];
let recordingType = '';

const screenPreview = document.getElementById('screenPreview');
const cameraPreview = document.getElementById('cameraPreview');
const screenBtn = document.getElementById('screenBtn');
const cameraBtn = document.getElementById('cameraBtn');
const bothBtn = document.getElementById('bothBtn');
const stopBtn = document.getElementById('stopBtn');
const downloadBtn = document.getElementById('downloadBtn');

const videoContainer = document.getElementById('videoContainer');
const splashScreen = document.getElementById('splashScreen');

splashScreen.src = 'SplashScreen.jpg';
splashScreen.alt = 'Splash Screen';
splashScreen.style.maxWidth = '100%';
splashScreen.style.height = 'auto';
splashScreen.style.display = 'block';

screenBtn.onclick = () => startRecording('screen');
cameraBtn.onclick = () => startRecording('camera');
bothBtn.onclick = () => startRecording('both');
stopBtn.onclick = stopRecording;
downloadBtn.onclick = download;

async function startRecording(type) {
    recordingType = type;
    screenChunks = [];
    cameraChunks = [];

    try {
        if (type === 'screen' || type === 'both') {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
                video: { aspectRatio: 16/9 },
                audio: true
            });
            screenRecorder = new MediaRecorder(screenStream);
            screenRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    screenChunks.push(event.data);
                }
            };
            screenRecorder.start();
            screenPreview.srcObject = screenStream;
            screenPreview.style.display = 'block';
        }

        if (type === 'camera' || type === 'both') {
            const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            cameraRecorder = new MediaRecorder(cameraStream);
            cameraRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    cameraChunks.push(event.data);
                }
            };
            cameraRecorder.start();
            cameraPreview.srcObject = cameraStream;
        }

        if (type === 'both') {
            cameraPreview.style.display = 'block';
        } else if (type === 'camera') {
            screenPreview.style.display = 'none';
            cameraPreview.style.display = 'block';
            cameraPreview.style.position = 'static';
            cameraPreview.style.width = '100%';
        }

        setTimeout(() => {
            setButtonsState(true);
        }, 100);
    } catch (error) {
        console.error('Error:', error);
        showSplashScreen();
        hideVideoContainer();
    }
}

function stopRecording() {
    if (screenRecorder && screenRecorder.state === 'recording') {
        screenRecorder.stop();
        screenRecorder.stream.getTracks().forEach(track => track.stop());
    }
    if (cameraRecorder && cameraRecorder.state === 'recording') {
        cameraRecorder.stop();
        cameraRecorder.stream.getTracks().forEach(track => track.stop());
    }
    screenPreview.srcObject = null;
    cameraPreview.srcObject = null;
    screenPreview.style.display = 'none';
    cameraPreview.style.display = 'none';
    setTimeout(() => {
        setButtonsState(false);
    }, 100);
}

function download() {
    if (recordingType === 'screen' || recordingType === 'both') {
        const screenBlob = new Blob(screenChunks, { type: 'video/webm' });
        const screenUrl = URL.createObjectURL(screenBlob);
        const screenA = document.createElement('a');
        screenA.style.display = 'none';
        screenA.href = screenUrl;
        screenA.download = 'screen_recording.webm';
        document.body.appendChild(screenA);
        screenA.click();
        setTimeout(() => {
            document.body.removeChild(screenA);
            window.URL.revokeObjectURL(screenUrl);
        }, 100);
    }

    if (recordingType === 'camera' || recordingType === 'both') {
        const cameraBlob = new Blob(cameraChunks, { type: 'video/webm' });
        const cameraUrl = URL.createObjectURL(cameraBlob);
        const cameraA = document.createElement('a');
        cameraA.style.display = 'none';
        cameraA.href = cameraUrl;
        cameraA.download = 'camera_recording.webm';
        document.body.appendChild(cameraA);
        cameraA.click();
        setTimeout(() => {
            document.body.removeChild(cameraA);
            window.URL.revokeObjectURL(cameraUrl);
        }, 100);
    }
}

function setButtonsState(isRecording) {
    screenBtn.style.display = isRecording ? 'none' : 'inline-block';
    cameraBtn.style.display = isRecording ? 'none' : 'inline-block';
    bothBtn.style.display = isRecording ? 'none' : 'inline-block';
    stopBtn.style.display = isRecording ? 'inline-block' : 'none';
    downloadBtn.style.display = isRecording ? 'none' : 
        ((screenChunks && screenChunks.length > 0) || (cameraChunks && cameraChunks.length > 0)) ? 'inline-block' : 'none';

    if (isRecording) {
        hideSplashScreen();
        showVideoContainer();
    } else {
        showSplashScreen();
        hideVideoContainer();
    }
}

// Initial button state and show splash screen
setButtonsState(false);

function showSplashScreen() {
    splashScreen.style.display = 'flex';
}

function hideSplashScreen() {
    splashScreen.style.display = 'none';
}

function showVideoContainer() {
    videoContainer.style.display = 'flex';
}

function hideVideoContainer() {
    videoContainer.style.display = 'none';
}

// Initial state
document.addEventListener('DOMContentLoaded', () => {
    setButtonsState(false);
});
