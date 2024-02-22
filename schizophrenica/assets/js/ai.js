// JavaScript function to handle the key down event
function handleKeyDown(event) {
    if (event.key === 'Enter' && event.target.value.trim() !== '') { // Check if 'Enter' was pressed and input is not empty
        event.preventDefault(); // Prevent the default behavior of the Enter key
        execute(event.target.value); // Call the execute function with the input's current value
        event.target.value = ''; // Optionally clear the input field after sending
    }
}
// The execute function that will receive the input value
function execute(input) {
    const baseUrl = 'http://127.0.0.1:5000/adjustmandel';
    const params = new URLSearchParams({ text: input });

    fetch(`${baseUrl}?${params}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            // Additional headers if required by server
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json(); // Return JSON response from server
    })
    .then(data => {
        console.log('Data received:', data);
        updateIframeControls(data); // Call the function to update the iframe controls
    })
    .catch(error => {
        console.error('Error fetching data:', error.message);
    });
}

function updateIframeControls(data) {
    const iframe = document.getElementById('your-iframe-id'); // Replace with your iframe's ID
    if (!iframe || !iframe.contentWindow) {
        console.error('Iframe is not fully loaded or found!');
        return;
    }
    
    // Get the window object of the iframe to access its global variables
    const iframeWindow = iframe.contentWindow;

    // Mapping from names to control IDs (as provided)
    const controlIDs = {
        "Red component": "lightR",
        "Green component": "lightG",
        "Blue component": "lightB",
        "Diffuse Int.": "diffIntensity",                        
        "Specular component": "specularComponent",
        "Specular exponent": "specularExponent",
        "Ambient int.": "ambientLight",
        "Color variation": "normalComponent",
        "Darkness": "shadowDarkness",
        "aoMult": "aoMult",
        "aoSub": "aoSub",
        "aoMix": "aoMix",
        "MBulb power": "Power",                        
        "maxIterations": "maxIterations",
        "maxDetail": "maxDetailIter",
        "Epsilon": "epsilon"
    };

    // Loop through the data object keys and find the corresponding slider
    for (const key in data) {
        const controlID = controlIDs[key];
        const sliderValue = data[key];
        const sliderIndex = Object.keys(controlIDs).indexOf(key);
        
        // Make sure we have a valid control ID and a valid index
        if (controlID && sliderIndex !== -1) {
            const slider = iframeWindow.controls[sliderIndex];
            
            if (slider) {
                // Calculate the new position for the slider using its scale
                const newPosition = (sliderValue - slider.startScale) / (slider.endScale - slider.startScale) * slider.controlSize;
                
                // Set the new position of the slider
                slider.moveTo(newPosition + slider.xMin);

                // Make sure the slider's update method is called (if it exists)
                if (typeof slider.update === 'function') {
                    slider.update();
                }
            }
        }
    }
}

// This function will likely be called once the fetch promise resolves
// make sure this function is accessible from where you are calling it