const btn = document.querySelector('.talk');
const content = document.querySelector('.content');
let videoElement = null; // Video element for camera feed
let mediaStream = null;  // Media stream for camera

function speak(text) {
    const text_speak = new SpeechSynthesisUtterance(text);
    text_speak.rate = 1.2; // Increased rate for faster speech
    text_speak.volume = 1;
    text_speak.pitch = 1;
    window.speechSynthesis.speak(text_speak);
}

function wishMe() {
    var day = new Date();
    var hour = day.getHours();

    if (hour >= 0 && hour < 12) {
        speak("Good Morning Boss...");
    } else if (hour >= 12 && hour < 17) {
        speak("Good Afternoon Master...");
    } else {
        speak("Good Evening Sir...");
    }
}

window.addEventListener('load', () => {
    speak("Initializing JARVIS...");
    wishMe();
});

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = false; // Only listen once per click
recognition.interimResults = false; // Only finalized results will trigger commands

recognition.onresult = async (event) => {
    const currentIndex = event.resultIndex;
    const transcript = event.results[currentIndex][0].transcript.trim();
    content.textContent = transcript;
    await takeCommand(transcript.toLowerCase()); // Use async/await for smoother handling
};

recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    speak("There was an error in voice recognition.");
};

btn.addEventListener('click', () => {
    content.textContent = "Listening....";
    recognition.start(); // Start listening when the button is clicked
});

async function takeCommand(message) {
    if (message.includes('hey') || message.includes('hello')) {
        speak("Hello Sir, How May I Help You?");
    } else if (message.includes("open google")) {
        window.open("https://google.com", "_blank");
        speak("Opening Google...");
    } else if (message.includes("open youtube")) {
        window.open("https://youtube.com", "_blank");
        speak("Opening Youtube...");
    } else if (message.includes("open facebook")) {
        window.open("https://facebook.com", "_blank"); // Open in new tab
        speak("Opening Facebook...");
    } else if (message.includes("open instagram")) {
        window.open("https://instagram.com", "_blank"); // Open in new tab
        speak("Opening Instagram...");
    } else if (message.includes('what is') || message.includes('who is') || message.includes('what are')) {
        const searchTerm = message.replace("what is", "").replace("who is", "").replace("what are", "").trim();
        try {
            const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchTerm)}`);
            const data = await response.json();
            if (data.extract) {
                speak(data.extract);
            } else {
                speak("Sorry, I couldn't find any information on that topic.");
            }
        } catch (error) {
            console.error('Error fetching Wikipedia data:', error);
            speak("Sorry, I couldn't fetch the information.");
        }
    } else if (message.includes('wikipedia')) {
        window.open(`https://en.wikipedia.org/wiki/${message.replace("wikipedia", "")}`, "_blank");
        const finalText = "This is what I found on Wikipedia regarding " + message;
        speak(finalText);
    } else if (message.includes('time')) {
        const time = new Date().toLocaleString(undefined, { hour: "numeric", minute: "numeric" });
        speak(time);
    } else if (message.includes('date')) {
        const date = new Date().toLocaleString(undefined, { month: "short", day: "numeric" });
        speak(date);
    } else if (message.includes('calculator')) {
        window.open('Calculator:///');
        speak("Opening Calculator...");
    } else if (message.includes('open camera')) {
        openCamera();
    } else if (message.includes('close camera')) {
        closeCamera();
    } else if (message.includes('weather')) {
        const conditions = ['sunny', 'cloudy', 'rainy', 'snowy'];
        const temp = Math.floor(Math.random() * 35) + 1; // Random temperature
        const weather = conditions[Math.floor(Math.random() * conditions.length)];
        speak(`The weather is currently ${weather} with a temperature of ${temp} degrees Celsius.`);
    } else if (message.includes('set a reminder for')) {
        const task = message.replace('set a reminder for', '').trim();
        speak(`Setting a reminder for ${task}.`);
        setTimeout(() => {
            speak(`Reminder: ${task}`);
        }, 10000); // Reminder after 10 seconds
    } else if (message.includes('play')) {
        const song = message.replace('play', '').trim();
        window.open(`https://www.youtube.com/results?search_query=${song}`, "_blank");
        speak(`Playing ${song} on YouTube.`);
    } else {
        window.open(`https://www.google.com/search?q=${message.replace(" ", "+")}`, "_blank");
        speak("I found some information for " + message + " on Google.");
    }
}

// Function to open the camera
function openCamera() {
    if (mediaStream) {
        speak("Camera is already open.");
        return;
    }
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            mediaStream = stream;  // Store the stream to stop it later
            videoElement = document.createElement('video');
            videoElement.srcObject = stream;
            videoElement.autoplay = true;
            videoElement.style.width = '100%';
            videoElement.style.height = '100%';
            document.body.appendChild(videoElement);
            speak("Opening camera...");
        })
        .catch(error => {
            console.error('Error accessing the camera:', error);
            speak("Sorry, I couldn't access the camera.");
        });
}

function closeCamera() {
    if (mediaStream && videoElement) {
        // Stop all tracks of the media stream
        mediaStream.getTracks().forEach(track => track.stop());
        
        // Remove the video element from the DOM
        if (videoElement.parentNode) {
            document.body.removeChild(videoElement);
        }

        // Reset the variables to null
        mediaStream = null;
        videoElement = null;

        speak("Camera has been closed.");
    } else if (!mediaStream && !videoElement) {
        // Case where the camera is already closed
        speak("The camera is already closed.");
    } else {
        // Handle unexpected scenarios
        speak("Something went wrong while trying to close the camera.");
        console.error("Unexpected state: mediaStream or videoElement is not behaving as expected.");
    }
}
