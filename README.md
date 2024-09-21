# Screen and Camera Recorder

This project allows you to record your screen and camera simultaneously. It uses the `MediaRecorder` API to record the screen and camera streams, and the `MediaStream` API to display the streams.

## Features

- Record screen and camera simultaneously
- Download recorded videos
- Stop recording

The prompt for AI is:

- I want to create a screen and camera recorder that allows me to record my screen and camera simultaneously. 
- I want to be able to download the recorded videos separately after stopping the recording.
- The UI should contain 3 buttons to start recording screen, camera and both.
- After stopping the recording, a download button should show up. It can download the appropriate video based on the recording type, and download both if the recording type is both.
- There should be a video element to show the recording screen.