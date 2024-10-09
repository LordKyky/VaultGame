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
var previousHandleRotation = 0; // Track the previous rotation
var counter = 0; // Initialize the counter

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

          sound.add('Click', 'assets/metalClick.mp3')

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
                } 
                else 
                {
                    console.log('Rotated Counterclockwise');
                }
                sound.play('Click'); // Play sound on successful 60-degree rotation
    
                // Update the last snapped rotation
                snappedHandleRotation = snappedRotation;
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