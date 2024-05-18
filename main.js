document.addEventListener('DOMContentLoaded', function () {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    document.body.addEventListener('click', function() {
        if (audioContext.state === 'suspended') {
            audioContext.resume().then(() => {
                console.log('AudioContext resumed successfully.');
            });
        }
    });

    const micButton = document.getElementById('micButton');
    const micOn = document.getElementById('micOn');
    const micOff = document.getElementById('micOff');
    const delaySlider = document.getElementById('delaySlider');
    const delayValue = document.getElementById('delayValue');
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeValue = document.getElementById('volumeValue');
    const volumeIcon = document.getElementById('volumeIcon');
    const volumeButton = document.getElementById('volumeButton');

    let delayNode = audioContext.createDelay(2.0);
    let gainNode = audioContext.createGain();
    let streamSource = null;
    let micEnabled = false;

    delaySlider.value = 200;
    delayValue.textContent = `Delay: ${delaySlider.value} ms`;
    delayNode.delayTime.value = delaySlider.value / 1000;

    volumeSlider.value = 70;
    volumeValue.textContent = `Volume: ${volumeSlider.value}%`;

    updateMicIcon(micEnabled);

    delaySlider.addEventListener('input', function () {
        delayValue.textContent = `Delay: ${this.value} ms`;
        delayNode.delayTime.value = this.value / 1000;
    });

    volumeSlider.addEventListener('input', function () {
        volumeValue.textContent = `Volume: ${this.value}%`;
        gainNode.gain.value = this.value / 100;
        updateVolumeIcon(this.value);
    });

    volumeButton.addEventListener('click', function () {
        if (volumeSlider.value != 0) {
            volumeSlider.value = 0;
            gainNode.gain.value = 0;
            volumeValue.textContent = `Volume: 0%`;
            updateVolumeIcon(0);
        } else {
            volumeSlider.value = 70;
            gainNode.gain.value = volumeSlider.value / 100;
            volumeValue.textContent = `Volume: ${volumeSlider.value}%`;
            updateVolumeIcon(volumeSlider.value);
        }
    });

    micButton.addEventListener('click', () => {
        micEnabled = !micEnabled;
        updateMicIcon(micEnabled);
        if (streamSource) {
            const track = streamSource.mediaStream.getTracks()[0];
            track.enabled = micEnabled;
        }
    });

    function updateVolumeIcon(volumeLevel) {
        if (volumeLevel == 0) {
            volumeIcon.src = 'icons/volume_mute.svg';
        } else if (volumeLevel <= 33) {
            volumeIcon.src = 'icons/volume_low.svg';
        } else if (volumeLevel <= 66) {
            volumeIcon.src = 'icons/volume_medium.svg';
        } else {
            volumeIcon.src = 'icons/volume_high.svg';
        }
        updateVolumeTooltip(volumeLevel);
    }

    function updateVolumeTooltip(volumeLevel) {
        volumeButton.title = volumeLevel > 0 ? "Mute Speaker" : "Unmute Speaker";
    }

    function updateMicIcon(isEnabled) {
        micOn.style.display = isEnabled ? 'inline' : 'none';
        micOff.style.display = isEnabled ? 'none' : 'inline';
        micButton.title = isEnabled ? "Mute Microphone" : "Unmute Microphone";
        micButton.classList.toggle('mic-muted', !isEnabled);
        micButton.classList.toggle('mic-unmuted', isEnabled);
    }

    async function setupAudio() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamSource = audioContext.createMediaStreamSource(stream);
            streamSource.connect(delayNode).connect(gainNode).connect(audioContext.destination);
            streamSource.mediaStream.getTracks()[0].enabled = micEnabled;
        } catch (err) {
            console.error('Error accessing microphone:', err);
        }
    }

    setupAudio();
});
