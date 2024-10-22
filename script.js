let animationFrameId; // Store the animation frame ID globally

// wait for dom to finish loading before loading models and updating UI
document.addEventListener('DOMContentLoaded', function () {
    // const scene = document.querySelector('a-scene');

    // scene.addEventListener('loaded', function () {
    //     console.log('A-Frame scene fully initialized');
        initializeMyApp();
    // });

});

// Step 1 --------------------------------
// Create dropdown containers

// --- Variables
let dropdownVisible = false; // Toogle to hide and unhide dropdown containers
let selectedIcon = null; // Track the currently selected icon

// --- Functions
function createDropdownContainer(){
    return new Promise((resolve, reject) => {
        
        try{
            let containersCreated = false; 
            const dropdownContainer = document.getElementById('dropdown-container'); // container housing all dropdown items
            const topLeftCircle = document.getElementById('top-left-circle'); // top left circle people click on to view more models.

            // handle visibility in another function. 
            topLeftCircle.addEventListener('click', modelDropDownVisibilityToggle);
            
            // fetch json to assign thumbnails based on names.
            fetch('./model_positions.json')
            .then(response => response.json())
            .then(data => {
                console.log('JSON loaded', data);
                createThumbnails(data);
            })
            .catch(error => {
                console.error('Error loading the JSON data:', error);
            });

            // Create the individual dropdown items.
            function createThumbnails(models){
                // Iterate over models and create thumbnails
                models.forEach(model => {
                    const thumbnail = document.createElement('div');
                    thumbnail.classList.add('dropdown-circle');
                    thumbnail.setAttribute('id', `${model.name}`);
                    // Create an image element for the model
                    const img = document.createElement('img');
                    img.src = `./assets/thumbnails/${model.name.toLowerCase()}.png`; // Assume icons follow model naming
                    img.alt = model.name;
                
                    // Append image to the circle
                    thumbnail.appendChild(img);

                    // apply all logic in separate function.
                    thumbnail.addEventListener('click', thumbnailClick)
                    // assign thumbnails to the container
                    dropdownContainer.appendChild(thumbnail);
                })
            }

            containersCreated = true;

            // tell the program that all the containers have been created if there were no errors and once it has iterated through all the objects in the json.
            if(containersCreated){
                resolve(containersCreated);
            }
        }
        catch(error){
            reject(error);
        }
        
    });

}

// Functions for DOM dropdown buttons
function modelDropDownVisibilityToggle(){
    const dropdownContainer = document.getElementById('dropdown-container'); // container housing all dropdown items
    dropdownVisible =!dropdownVisible;
    dropdownContainer.style.display = dropdownVisible? 'flex' : 'none';
}

// click event for thumbnails
function thumbnailClick(event){
    const clickedIcon = event.currentTarget; // Get the clicked thumbnail
    if(clickedIcon === selectedIcon){
        console.log('Already selected!');
    }
    else {
        // deselect previous icon
        if (selectedIcon) {
            selectedIcon.classList.remove('selected');
        }
        //select new icon
        clickedIcon.classList.add('selected');
        selectedIcon = clickedIcon;
        console.log(`selected icon ${selectedIcon.id}`);
        selectNewModel(clickedIcon.id);
    }
}

// What happens when you select a new model
function selectNewModel(name){
    const locationDisplay = document.getElementById('location-display');
    locationDisplay.innerHTML = `${name}`;   
}

// Step 2 --------------------------------
// Create models within a-frame
function renderModels(){
    return new Promise((resolve, reject) => {
        try{
            // Variables
            let modelsRendered = false;
            let scene = document.querySelector('a-scene');

            // fetch json to create models.
            fetch('./model_positions.json')
           .then(response => response.json())
           .then(data => {
                console.log('JSON loaded', data);
                createModels(data);
            })
           .catch(error => {
                console.error('Error loading the JSON data:', error);
            });

            // Function to create each model from the json.
            function createModels(models){
                models.forEach(modelSeparated => {
                    let latitude = modelSeparated.location.lat;
                    let longitude = modelSeparated.location.lng;
                    let filePath = modelSeparated.filePath;
                    let visibilityRange = modelSeparated.visibilityRange;
                    let name = modelSeparated.name;

                    console.log(`Creating model for: ${name} at (${latitude}, ${longitude}) with visibility range [${visibilityRange.min}m - ${visibilityRange.max}m]`);    

                    // Create a new entity for each place
                    let model = document.createElement('a-entity');
                    model.setAttribute('gps-entity-place', `latitude: ${latitude}; longitude: ${longitude};`);
                    model.setAttribute('gltf-model', `${filePath}`);
                    model.setAttribute('rotation', '0 0 0');
                    model.setAttribute('animation-mixer', 'clip: *; loop: repeat; timeScale: 1.1; clampWhenFinished: true; crossFadeDuration: 0.3');
                    model.setAttribute('look-at', '[gps-camera]');
                    model.setAttribute('scale', '0.15 0.15 0.15'); // Initial scale
                    model.setAttribute('visible', 'true'); // Initially visible 
                    
                    model.addEventListener('model-loaded', () => {
                        model.classList.add(`${name}`);
                        scene.appendChild(model);
                    })
                })
            }

            modelsRendered = true;

            if(modelsRendered){
                resolve(modelsRendered);
            }

        } 
        catch(error){
            reject(error);
        }
    })
}

// async function initilizeMyApp()
// Order
// 1. Create dropdown containers with models assign to them.
// 2. Create models within a-frame
// 3. Start Up Button.

async function initializeMyApp(){
    // 1.
    const dropdownRender = await createDropdownContainer();

    // 2.
    const modelRender = await renderModels();
}