document.addEventListener('DOMContentLoaded', () => {
    let screenRecorder, cameraRecorder;
    let screenChunks = [], cameraChunks = [];
    let displayStream, cameraStream;
    let lastRecordingMode = null;
    let isRecording = false;

    const startCameraBtn = document.getElementById('startCameraBtn');
    const startScreenBtn = document.getElementById('startScreenBtn');
    const startBothBtn = document.getElementById('startBothBtn');
    const stopBtn = document.getElementById('stopBtn');
    const preview = document.getElementById('preview');
    const cameraPreview = document.getElementById('cameraPreview');
    const screenDownloadBtn = document.getElementById('screenDownloadBtn');
    const cameraDownloadBtn = document.getElementById('cameraDownloadBtn');

    startCameraBtn.addEventListener('click', () => startRecording('camera'));
    startScreenBtn.addEventListener('click', () => startRecording('screen'));
    startBothBtn.addEventListener('click', () => startRecording('both'));
    stopBtn.addEventListener('click', stopRecording);
    screenDownloadBtn.addEventListener('click', () => downloadRecording(screenChunks, 'screen-recording.webm'));
    cameraDownloadBtn.addEventListener('click', () => downloadRecording(cameraChunks, 'camera-recording.webm'));

    async function startRecording(mode) {
        try {
            lastRecordingMode = mode;
            screenChunks = [];
            cameraChunks = [];
            isRecording = true;

            if (mode === 'camera' || mode === 'both') {
                cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                cameraPreview.srcObject = cameraStream;
                cameraPreview.play();
                cameraRecorder = new MediaRecorder(cameraStream, { mimeType: 'video/webm' });
                cameraRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        cameraChunks.push(event.data);
                    }
                };
                cameraRecorder.start();
            }

            if (mode === 'screen' || mode === 'both') {
                displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
                preview.srcObject = displayStream;
                preview.play();
                screenRecorder = new MediaRecorder(displayStream, { mimeType: 'video/webm' });
                screenRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        screenChunks.push(event.data);
                    }
                };
                screenRecorder.start();
            }

            console.log(`Recording started: ${mode}`);

            updateUI();
        } catch (error) {
            console.error('Error starting recording:', error);
            alert('Error accessing media devices. Please ensure you have granted the necessary permissions.');
            isRecording = false;
            updateUI();
        }
    }

    function stopRecording() {
        if (screenRecorder && screenRecorder.state !== 'inactive') {
            screenRecorder.stop();
            console.log('Stopping screen recorder:', screenRecorder.state);
        }
        if (cameraRecorder && cameraRecorder.state !== 'inactive') {
            cameraRecorder.stop();
            console.log('Stopping camera recorder:', cameraRecorder.state);
        }

        // Stop all tracks
        if (displayStream) {
            displayStream.getTracks().forEach(track => track.stop());
        }
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
        }

        isRecording = false;
        updateUI();
    }

    function updateUI() {
        const recordButtons = [startCameraBtn, startScreenBtn, startBothBtn];
        const downloadButtons = [screenDownloadBtn, cameraDownloadBtn];

        if (isRecording) {
            recordButtons.forEach(btn => btn.style.display = 'none');
            downloadButtons.forEach(btn => btn.style.display = 'none');
            stopBtn.style.display = 'inline-block';
            stopBtn.disabled = false;
            
            // Show preview based on recording mode
            if (lastRecordingMode === 'screen' || lastRecordingMode === 'both') {
                preview.style.display = 'block';
                cameraPreview.style.display = 'none';
            } else if (lastRecordingMode === 'camera') {
                preview.style.display = 'none';
                cameraPreview.style.display = 'block';
            }
        } else {
            recordButtons.forEach(btn => btn.style.display = 'inline-block');
            stopBtn.style.display = 'none';
            stopBtn.disabled = true;
            
            // Show download buttons and preview based on last recording mode
            if (lastRecordingMode === 'camera' || lastRecordingMode === 'both') {
                cameraDownloadBtn.style.display = 'inline-block';
                cameraDownloadBtn.disabled = false;
            }
            if (lastRecordingMode === 'screen' || lastRecordingMode === 'both') {
                screenDownloadBtn.style.display = 'inline-block';
                screenDownloadBtn.disabled = false;
            }
            
            // Display recorded video
            if (screenChunks.length > 0) {
                const screenBlob = new Blob(screenChunks, { type: 'video/webm' });
                preview.src = URL.createObjectURL(screenBlob);
                preview.style.display = 'block';
                cameraPreview.style.display = 'none';
            } else if (cameraChunks.length > 0) {
                const cameraBlob = new Blob(cameraChunks, { type: 'video/webm' });
                cameraPreview.src = URL.createObjectURL(cameraBlob);
                cameraPreview.style.display = 'block';
                preview.style.display = 'none';
            } else {
                preview.style.display = 'none';
                cameraPreview.style.display = 'none';
            }
        }
    }

    function downloadRecording(chunks, filename) {
        if (chunks.length === 0) {
            console.warn('No data to download');
            return;
        }
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
    }

    // Initial UI setup
    updateUI();
});