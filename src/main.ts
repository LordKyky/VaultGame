import './style.css'
import typescriptLogo from './typescript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.ts'

import { Application, Assets, Sprite } from 'pixi.js';
import { InteractionEvent } from 'pixi.js';
import { sound } from '@pixi/sound'; // Import the sound module

import { gsap } from "gsap";   
import { PixiPlugin } from "gsap/PixiPlugin";

gsap.registerPlugin(PixiPlugin);

var size = [1920, 1080];
var ratio = size[0] / size[1];

var dragging = false;
var initialMouseAngle = 0;
var initialHandleRotation = 0;

var currentHandleRotation = 0; // Track the current rotation
var snappedHandleRotation = 0; // Track the last snapped rotation at 60-degree increments
var counter = 0; // Initialize the counter

// Track the current step in the sequence
let currentStep = 0;
let successfulSteps = 0;

// Function to generate random number between min and max
function getRandomInt(min: number, max: number): number 
{
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to generate secret combination
function generateSecretCode(length: number): number[] {
  const code = [];

  // Randomly decide whether to start with positive or negative
  let startPositive = Math.random() < 0.5;

  for (let i = 0; i < length; i++) {
      // Generate a random number between 1 and 9
      let randomNum = getRandomInt(1, 9);
      
      // Alternate between positive and negative starting with the random sign
      if ((i % 2 === 0 && !startPositive) || (i % 2 !== 0 && startPositive)) {
        randomNum = -randomNum;
    }
      
      // Push the number into the array
      code.push(randomNum);
  }
  return code;
}

(async () =>
  {
    // Create a new application
    const app = new Application();
  
    // Initialize the application
    await app.init({ background: '#fcba03', resizeTo: window }).then(() =>
      {
        app.canvas.style.position = 'absolute';
  
        // Append the application canvas to the document body
        document.body.appendChild(app.canvas);
  
        // Add the assets to load
        Assets.add({ alias: 'bg', src: 'assets/bg.png' });
        Assets.add({ alias: 'door', src: 'assets/door.png' });
        Assets.add({ alias: 'handleShadow', src: 'assets/handleShadow.png' });
        Assets.add({ alias: 'handle', src: 'assets/handle.png' });
    
        // Start loading right away and create a promise
        //const texturePromise = Assets.load('https://pixijs.com/assets/bunny.png');
  
        // Load the assets and get a resolved promise once both are loaded
        const texturesPromise = Assets.load(['bg', 'door', 'handleShadow', 'handle']); // => Promise<{flowerTop: Texture, eggHead: Texture}>
  
    
        // When the promise resolves, we have the textures!
        texturesPromise.then((textures) =>
        {
          // Create a new Sprite from the resolved loaded Texture for background
          const bg = Sprite.from(textures.bg);

          // Center the sprite's anchor point
          bg.anchor.set(0.5);

          // Move the background sprite to the center of the screen
          bg.x = app.screen.width / 2;
          bg.y = app.screen.height / 2;

          // Set height and width of background to screen size
          bg.width = app.screen.width;
          bg.height = app.screen.height;

          app.stage.addChild(bg);

          // Create a new Sprite from the resolved loaded Texture for door
          const door = Sprite.from(textures.door);

          // Center the sprite's anchor point
          door.anchor.set(0.5);

          // Move the door sprite to the center of the screen
          door.x = app.screen.width / 2 + 14;
          door.y = app.screen.height / 2 - 9.5;

          // Set height and width of door to the screen size
          door.width = app.screen.width / 3;
          door.height = app.screen.height / 1.55;

          app.stage.addChild(door);

          // Create a new Sprite from the resolved loaded Texture for handle shadow
          const handleShadow = Sprite.from(textures.handleShadow);

          // Center the sprite's anchor point
          handleShadow.anchor.set(0.5);

          // Move the handle sprite to the center of the door sprite
          handleShadow.x = door.x / 1.027;
          handleShadow.y = door.y * 1.03;

          // Set height and width of handle shadow to the door size
          handleShadow.width = door.width / 2.95;
          handleShadow.height = door.height / 2.55;

          app.stage.addChild(handleShadow);

          // Create a new Sprite from the resolved loaded Texture for handle shadow
          const handle = Sprite.from(textures.handle);

          // Center the sprite's anchor point
          handle.anchor.set(0.5);

          // Move the handle sprite to the center of the door sprite
          handle.x = door.x / 1.027;
          handle.y = door.y;

          // Set height and width of handle shadow to the door size
          handle.width = door.width / 2.95;
          handle.height = door.height / 2.55;

          handle.interactive = true;
          handle.eventMode = 'static';
          handle.cursor = 'pointer';

          app.stage.addChild(handle);

          sound.add('Click', 'assets/metalClick.mp3');
          sound.add('Success', 'assets/success.mp3');
          
          // Log the generated secret code in the console
          const secretCode = generateSecretCode(3);  // Generate 5-digit combination
          console.log("Secret Code:", secretCode);

          let currentRotationSteps = 0; // Accumulated steps (each step is 60 degrees)
          let targetSteps = Math.abs(secretCode[currentStep]); // Steps required for the current step
          let isClockwise = secretCode[currentStep] > 0; // Direction for current step (true if positive)

          // Save the initial rotation and the mouse angle on pointerdown
          handle.on('pointerdown', (event: InteractionEvent) => 
          {
            dragging = true;
            const global = event.data.global;
            initialMouseAngle = Math.atan2(global.y - handle.y, global.x - handle.x);
            initialHandleRotation = handle.rotation;
          });
          
          // On pointerup, snap the rotation and stop dragging
          handle.on('pointerup', () => 
          {
            if (dragging) 
            {
              dragging = false;
        
              // Snap rotation to 60-degree increments
              const snappedRotation = Math.round(currentHandleRotation / (Math.PI / 3)) * (Math.PI / 3);
              gsap.to(handle, { rotation: snappedRotation, duration: 0.3 });
              gsap.to(handleShadow, { rotation: snappedRotation, duration: 0.3 });
              currentHandleRotation = snappedRotation; // Update current rotation
            }
          });
          
          handle.on('pointerupoutside', () => 
          {
            dragging = false;
          });
          
          // Rotate the handle during dragging
          handle.on('pointermove', (event: InteractionEvent) => 
          {
            if (dragging) 
            {
              const global = event.data.global;
              const currentMouseAngle = Math.atan2(global.y - handle.y, global.x - handle.x);
              const angleDelta = currentMouseAngle - initialMouseAngle;
        
              // Update the current handle rotation
              currentHandleRotation = initialHandleRotation + angleDelta;

              // Normalize rotation to stay within 0 and 2 * PI
              while (currentHandleRotation < 0) currentHandleRotation += 2 * Math.PI;
              while (currentHandleRotation >= 2 * Math.PI) currentHandleRotation -= 2 * Math.PI;

              const snappedRotation = Math.round(currentHandleRotation / (Math.PI / 3)) * (Math.PI / 3);

              // Determine the direction of rotation
              let rotationDifference = snappedRotation - snappedHandleRotation;

              // If the rotation crosses 0 or 360 degrees (2 * Math.PI), adjust the difference
              if (rotationDifference > Math.PI) 
              {
                rotationDifference -= 2 * Math.PI;
              } 
              else if (rotationDifference < -Math.PI) 
              {
                rotationDifference += 2 * Math.PI;
              }
              
              // Detect full 60-degree increments and trigger action
              if (Math.abs(rotationDifference) >= (Math.PI / 3) -0.01) // Small tolerance
              { 
                if (rotationDifference > 0) 
                {
                    console.log('Rotated Clockwise');

                    if (isClockwise) 
                    {
                      currentRotationSteps++;
                    } 
                    else 
                    {
                      currentRotationSteps = 0; // Reset if wrong direction
                    }
                } 
                else 
                {
                    console.log('Rotated Counterclockwise');

                    if (!isClockwise) 
                    {
                      currentRotationSteps++;
                    } 
                    else 
                    {
                      currentRotationSteps = 0; // Reset if wrong direction
                    }
                }
                sound.play('Click'); // Play sound on successful 60-degree rotation
    
                // Update the last snapped rotation
                snappedHandleRotation = snappedRotation;

                // Check if the step was completed
                if (currentRotationSteps >= targetSteps) {
                  successfulSteps++;
                  currentStep++;
                  if (currentStep >= secretCode.length) {
                      console.log('Secret code entered successfully!');
                      sound.play('Success'); // Play success sound
                  } else {
                      // Move to the next step
                      targetSteps = Math.abs(secretCode[currentStep]);
                      isClockwise = secretCode[currentStep] > 0;
                      currentRotationSteps = 0; // Reset for next step
                  }
              }
              }
    
              // Update the last snapped rotation
              //snappedHandleRotation = snappedRotation;
              //currentHandleRotation = snappedRotation; // Update current rotation
        
              // Apply the new rotation directly
              handle.rotation = currentHandleRotation;
              handleShadow.rotation = currentHandleRotation;
              //console.log(currentHandleRotation);
            }
          });
        });
      });
  })();